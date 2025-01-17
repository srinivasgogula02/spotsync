import React, { useState } from 'react';

const LandMark = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [landmarks, setLandmarks] = useState(['']);
  const [location, setLocation] = useState('');
  const [proximityThreshold, setProximityThreshold] = useState('1.0');

  const addLandmark = () => {
    setLandmarks([...landmarks, '']);
  };

  const removeLandmark = (index) => {
    const newLandmarks = landmarks.filter((_, i) => i !== index);
    setLandmarks(newLandmarks.length ? newLandmarks : ['']);
  };

  const updateLandmark = (index, value) => {
    const newLandmarks = [...landmarks];
    newLandmarks[index] = value;
    setLandmarks(newLandmarks);
  };

  const fetchClusters = async () => {
    if (!location.trim()) {
      setError('Location is required');
      return;
    }

    const validLandmarks = landmarks.filter(l => l.trim());
    if (validLandmarks.length < 2) {
      setError('At least 2 landmarks are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/v1/clusters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          landmarks: validLandmarks,
          location,
          proximity_threshold: parseFloat(proximityThreshold)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      setClusters(data);
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Find Landmark Clusters</h1>
      
      <div className="space-y-6">
        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            placeholder="Enter city or area (e.g., New York)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Landmarks Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Landmarks</label>
          <div className="space-y-2">
            {landmarks.map((landmark, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter landmark name"
                  value={landmark}
                  onChange={(e) => updateLandmark(index, e.target.value)}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {landmarks.length > 1 && (
                  <button
                    onClick={() => removeLandmark(index)}
                    className="px-3 py-2 bg-red-50 text-red-500 rounded hover:bg-red-100"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addLandmark}
              className="w-full p-2 border border-dashed rounded hover:bg-gray-50"
            >
              + Add Landmark
            </button>
          </div>
        </div>

        {/* Proximity Threshold Input */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Proximity Threshold (km)
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={proximityThreshold}
            onChange={(e) => setProximityThreshold(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={fetchClusters}
          disabled={loading}
          className={`w-full p-2 rounded text-white ${
            loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? 'Loading...' : 'Find Clusters'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 text-red-500 rounded">
            Error: {error}
          </div>
        )}

        {/* Results Display */}
        {clusters && (
          <div className="space-y-4 mt-6">
            <p className="font-medium">
              Total Clusters: {clusters.data.total_clusters}
            </p>
            {Object.entries(clusters.data.clusters).map(([id, cluster]) => (
              <div key={id} className="p-4 border rounded">
                <h3 className="font-bold mb-2">Cluster {id}</h3>
                <div className="space-y-1">
                  {cluster.landmarks.map((landmark, index) => (
                    <p key={index} className="text-sm">
                      <strong>LandMark{index+1}</strong>:  {landmark.name} - {landmark.address}
                    </p>
                  ))}
                  <p className="text-sm text-gray-600 mt-2">
                    Average Distance: {cluster.metrics.average_distance.toFixed(2)}km
                  </p>
                  <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                      <a href={`https://www.google.com/maps?q=${cluster.midpoint.lat},${cluster.midpoint.lng}`}target='_blank'rel="noopener noreferrer"className="flex items-center gap-2">Open in Google Maps</a></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandMark;