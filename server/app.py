from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import requests
from math import radians, sin, cos, sqrt, atan2
from itertools import combinations
import uuid
import logging

# Enable debugging logs
logging.basicConfig(level=logging.DEBUG)

app = FastAPI(
    title="Landmark Cluster API",
    description="API for finding clusters of landmarks in a given location",
    version="1.0.0"
)

# Origins allowed to access the API
origins = [
      "*"  # Mobile frontend (your mobile device's IP)
]

# Add CORS middleware to handle cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow the frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    max_age=86400,  # Cache preflight requests for 24 hours
)

class LocationRequest(BaseModel):
    landmarks: List[str] = Field(..., description="List of landmarks to search for")
    location: str = Field(..., description="Location to search in")
    proximity_threshold: float = Field(1.0, description="Maximum distance between landmarks in kilometers")

# Search for places using Olamaps API
def search_places(landmark: str, location: str) -> List[Dict]:
    place = f"{landmark} in {location}"
    api_key = "IInXYC3x8Kqv3nRjk3YBMMl4MCykdsD6nAB8CUuG"  # Replace with your actual API key
    url = f"https://api.olamaps.io/places/v1/textsearch?input={place}&api_key={api_key}"
    headers = {
        "X-Request-Id": str(uuid.uuid4())
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        results = response.json().get("predictions", [])
        formatted_results = [
            {
                "name": place["name"],
                "lat": float(place["geometry"]["location"]["lat"]),
                "lng": float(place["geometry"]["location"]["lng"]),
                "formatted_address": place["formatted_address"],
                "types": place["types"]
            }
            for place in results
        ]
        
        return formatted_results
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Error accessing places API: {str(e)}")

# Haversine formula to calculate distance between two points
def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    try:
        R = 6371  # Earth's radius in kilometers
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        
        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)
        
        lat1, lat2 = radians(lat1), radians(lat2)
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        a = max(min(a, 1), 0)
        
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        distance = R * c
        
        return distance
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error calculating distance: {str(e)}"
        )

# Check if landmarks are within proximity threshold
def check_cluster_validity(places: List[Dict], proximity_threshold: float) -> tuple:
    if len(places) < 2:
        return False, []
        
    distances = []
    for place1, place2 in combinations(places, 2):
        dist = haversine(place1["lat"], place1["lng"], place2["lat"], place2["lng"])
        if dist > proximity_threshold:
            return False, []
        distances.append(dist)
    return True, distances

# Calculate the midpoint of the landmarks
def calculate_midpoint(places: List[Dict]) -> tuple:
    if not places:
        return 0, 0
        
    latitudes = [float(place["lat"]) for place in places]
    longitudes = [float(place["lng"]) for place in places]
    
    midpoint_lat = sum(latitudes) / len(latitudes)
    midpoint_lng = sum(longitudes) / len(longitudes)
    
    return midpoint_lat, midpoint_lng

# Generate cluster IDs
def generate_cluster_id(index: int) -> str:
    return index+1

# Handle CORS preflight request explicitly for debugging
@app.options("/api/v1/clusters")
async def options_handler():
    return JSONResponse(content={}, status_code=200)

# Main route to find clusters of landmarks
@app.post("/api/v1/clusters")
async def find_clusters(request: LocationRequest):
    try:
        results = {landmark: search_places(landmark, request.location) 
                  for landmark in request.landmarks}
        
        landmark_places = [results[landmark] for landmark in request.landmarks]
        
        if not all(landmark_places):
            return {
                "status": "error",
                "message": "No results found for some landmarks",
                "data": {
                    "clusters": []
                }
            }
        
        place_combinations = []
        
        def generate_combinations(current_combination, remaining_places):
            if not remaining_places:
                place_combinations.append(current_combination)
                return
            
            for place in remaining_places[0]:
                generate_combinations(current_combination + [place], remaining_places[1:])
        
        generate_combinations([], landmark_places)
        
        valid_clusters = []
        for combination in place_combinations:
            is_valid, distances = check_cluster_validity(
                combination, 
                request.proximity_threshold
            )
            if is_valid:
                midpoint_lat, midpoint_lng = calculate_midpoint(combination)
                valid_clusters.append({
                    "landmarks": [
                        {
                            "name": place["name"],
                            "location": {
                                "lat": place["lat"],
                                "lng": place["lng"]
                            },
                            "address": place["formatted_address"],
                            "types": place["types"]
                        } for place in combination
                    ],
                    "metrics": {
                        "distances": [float(d) for d in distances],
                        "average_distance": float(sum(distances) / len(distances)) if distances else 0
                    },
                    "midpoint": {
                        "lat": float(midpoint_lat),
                        "lng": float(midpoint_lng)
                    }
                })
        
        # Sort clusters by average distance
        valid_clusters.sort(key=lambda x: x["metrics"]["average_distance"])
        
        # Add cluster IDs to sorted clusters
        clusters_with_ids = {}
        for idx, cluster in enumerate(valid_clusters):
            cluster_id = generate_cluster_id(idx)
            clusters_with_ids[cluster_id] = cluster
        
        return {
            "status": "success",
            "message": "Clusters found successfully",
            "data": {
                "total_clusters": len(clusters_with_ids),
                "clusters": clusters_with_ids
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
