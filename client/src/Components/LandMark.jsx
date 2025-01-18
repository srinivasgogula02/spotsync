import React, { useState } from 'react';
import { AlertCircle, ExternalLink, Loader2, MapPin, Plus, X, Search, Info, ChevronDown, Star, Users, Home, Coffee, Briefcase } from 'lucide-react';

const LandmarkClusters = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clusters, setClusters] = useState(null);
  const [landmarks, setLandmarks] = useState(['']);
  const [location, setLocation] = useState('');
  const [proximityThreshold, setProximityThreshold] = useState('1.0');
  const [purpose, setPurpose] = useState('outing');
  const [showHowTo, setShowHowTo] = useState(false);

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
      const requestData = {
        landmarks: validLandmarks,
        location,
        proximity_threshold: parseFloat(proximityThreshold)
      };

      console.log('Sending request:', requestData);

      const response = await fetch('http://192.168.1.86:8000/api/v1/clusters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      setClusters(data.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const useCases = [
    { icon: Users, title: 'Plan Group Outings', description: 'Find the perfect spot for your friends to meet up.' },
    { icon: Coffee, title: 'Discover Date Locations', description: 'Impress your date with a perfectly planned evening.' },
    { icon: Home, title: 'Real Estate Search', description: 'Find properties near all your preferred amenities.' },
    { icon: Briefcase, title: 'Business Location Scouting', description: 'Choose the ideal location for your new office or store.' },
  ];

  const testimonials = [
    { name: 'Sarah M.', role: 'Event Planner', text: 'LandmarkClusters has revolutionized how I plan events. It\'s a game-changer!' },
    { name: 'Alex T.', role: 'Real Estate Agent', text: 'This tool helps me find the perfect properties for my clients every time.' },
    { name: 'Emily R.', role: 'Food Blogger', text: 'I use LandmarkClusters to plan my food tours. It\'s simply amazing!' },
  ];
  

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h1 className="text-3xl font-bold">LandmarkClusters</h1>
              <p className="text-sm">Discover Your Perfect Location</p>
            </div>
          </div>
          {/* <nav>
            <ul className="flex space-x-6">
              <li><a href="#how-to-use" className="hover:text-indigo-200">How to Use</a></li>
              <li><a href="#use-cases" className="hover:text-indigo-200">Use Cases</a></li>
              <li><a href="#testimonials" className="hover:text-indigo-200">Testimonials</a></li>
            </ul>
          </nav> */}
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* <section className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Find Your Ideal Location Cluster</h2>
          <p className="text-xl text-gray-600">Discover areas with all your desired landmarks within easy reach.</p>
        </section> */}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Start Your Search</h2>
            <div className="space-y-6">
              {/* <div className="space-y-2">
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">Purpose</label>
                <select
                  id="purpose"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="outing">Planning an Outing</option>
                  <option value="date">Planning a Date</option>
                  <option value="realestate">Real Estate Search</option>
                  <option value="business">Business Location</option>
                  <option value="other">Other</option>
                </select>
              </div> */}

              <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <div className="relative">
                  <input
                    id="location"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter city or area (e.g., New York)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Landmarks</label>
                <div className="space-y-2">
                  {landmarks.map((landmark, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter landmark name"
                        value={landmark}
                        onChange={(e) => updateLandmark(index, e.target.value)}
                      />
                      {landmarks.length > 1 && (
                        <button
                          className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => removeLandmark(index)}
                          aria-label="Remove landmark"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={addLandmark}
                  >
                    <Plus className="inline-block mr-2 h-4 w-4" /> Add Landmark
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="proximityThreshold" className="block text-sm font-medium text-gray-700">
                  Proximity Threshold (km)
                </label>
                <div className="relative">
                  <input
                    id="proximityThreshold"
                    className="w-full pr-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={proximityThreshold}
                    onChange={(e) => setProximityThreshold(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Info className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">Maximum distance between landmarks in a cluster</p>
              </div>

              <button
                className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                onClick={fetchClusters}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="inline-block mr-2 h-4 w-4" />
                    Find Clusters
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {clusters && (
          <div className="mt-8 space-y-8">
            <h3 className="text-2xl font-bold">Results</h3>
            <p className="text-lg">
              Total Clusters: <span className="font-semibold">{clusters.total_clusters}</span>
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(clusters.clusters).map(([id, cluster]) => (
                <div key={id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div className="p-6 space-y-4">
                    <h4 className="text-xl font-semibold">Cluster {id}</h4>
                    <div className="space-y-2">
                      {cluster.landmarks.map((landmark, index) => (
                        <div key={index} className="flex items-start">
                          <MapPin className="h-5 w-5 text-indigo-500 mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{landmark.name}</p>
                            <p className="text-sm text-gray-500">{landmark.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      Average Distance: <span className="font-semibold">{cluster.metrics.average_distance.toFixed(2)} km</span>
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${cluster.midpoint.lat},${cluster.midpoint.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      View on Map
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        <section id="use-cases" className="my-16">
          <h2 className="text-3xl font-bold mb-6">Use Cases</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 flex items-start space-x-4">
                  <useCase.icon className="h-8 w-8 text-indigo-500" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-gray-600">{useCase.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-to-use" className="my-16">
          <h2 className="text-3xl font-bold mb-6">How to Use LandmarkClusters</h2>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <ol className="list-decimal list-inside space-y-4">
                <li><strong>Select your purpose:</strong> Choose why you're using LandmarkClusters (e.g., planning an outing, real estate search).</li>
                <li><strong>Enter your location:</strong> Specify the city or area you're interested in.</li>
                <li><strong>Add landmarks:</strong> Input the places or types of locations you want nearby.</li>
                <li><strong>Set proximity threshold:</strong> Decide the maximum distance between landmarks in a cluster.</li>
                <li><strong>Click 'Find Clusters':</strong> Our algorithm will find the best areas matching your criteria.</li>
                <li><strong>Review results:</strong> Explore the clusters we've found and their details.</li>
                <li><strong>View on map:</strong> Click to see the cluster's midpoint on Google Maps for a better understanding of the area.</li>
              </ol>
            </div>
          </div>
        </section>


        <section id="testimonials" className="my-16">
          <h2 className="text-3xl font-bold mb-6">What Our Users Say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                  <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  </div>
                  <p className="font-semibold mt-2">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About LandmarkClusters</h3>
              <p className="text-sm text-gray-400">Discover perfect locations with all your desired landmarks nearby. Whether for leisure, business, or real estate, we've got you covered.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#how-to-use" className="text-sm text-gray-400 hover:text-white">How to Use</a></li>
                <li><a href="#use-cases" className="text-sm text-gray-400 hover:text-white">Use Cases</a></li>
                <li><a href="#testimonials" className="text-sm text-gray-400 hover:text-white">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} LandmarkClusters. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandmarkClusters;

