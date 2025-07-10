"use client";

import { useEffect, useState } from "react";
// CORRECTED IMPORT: Use a default import because LoadingBall is exported as default.
import LoadingBall from "@/components/ui/LoadingBall"; // Assuming the file is LoadingBall.tsx inside components/ui

/**
 * Main application component to demonstrate the LoadingBall.
 * This component simulates a loading state and displays the LoadingBall
 * during that period, then shows content once loading is complete.
 * It also showcases various LoadingBall configurations.
 */
const App: React.FC = () => {
  // State to control the loading status
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // State to hold simulated data after loading
  const [data, setData] = useState<string | null>(null);

  /**
   * useEffect hook to simulate an asynchronous data fetch.
   * This runs once when the component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Ensure loading is true before starting fetch
      setData(null); // Clear previous data

      try {
        // Simulate a network request delay (e.g., 3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Once the "data" is fetched, set it
        setData("Your delicious Shelivery order is ready!");
      } catch (error) {
        console.error("Error fetching data:", error);
        setData("Failed to load content. Please try again.");
      } finally {
        // Set loading to false whether the fetch succeeded or failed
        setIsLoading(false);
      }
    };

    fetchData(); // Call the simulated fetch function
  }, []); // Empty dependency array means this effect runs only once on component mount

  /**
   * Handler for the "Reload Content" button.
   * Resets the state to simulate a new loading process.
   */
  const handleReloadContent = () => {
    // Reset states to trigger loading animation again
    setData(null);
    setIsLoading(true);

    // Re-run the data fetching simulation
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setData("Fresh Shelivery content has arrived!");
      } catch (error) {
        console.error("Error fetching data:", error);
        setData("Failed to reload content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-shelivery-background-gray p-shelivery-4 font-poppins text-shelivery-text-primary">
      {/* Main title for the test page */}
      <h1 className="text-3xl font-bold mb-shelivery-8 text-shelivery-primary-blue">
        LoadingBall Component Test Page
      </h1>

      {/* Conditional rendering based on isLoading state */}
      {isLoading ? (
        // Display loading state
        <div className="flex flex-col items-center space-y-shelivery-4 p-shelivery-8 bg-shelivery-card-background rounded-shelivery-md shadow-shelivery-md w-full max-w-md">
          <LoadingBall size="large" color="shelivery-primary-yellow" />
          <p className="text-lg text-shelivery-text-primary">Loading your Shelivery content...</p>
        </div>
      ) : (
        // Display loaded content
        <div className="text-center p-shelivery-8 bg-shelivery-card-background rounded-shelivery-md shadow-shelivery-md w-full max-w-md">
          <p className="text-shelivery-success-green text-xl font-semibold mb-shelivery-4">
            {data}
          </p>
          <p className="text-shelivery-text-primary mb-shelivery-6">
            This section now displays the content that was loaded.
            You can integrate this pattern throughout your application
            where data needs to be fetched.
          </p>
          <button
            onClick={handleReloadContent}
            className="shelivery-button-primary" // Using your custom button style
          >
            Reload Content
          </button>
        </div>
      )}

      {/* Section to showcase different LoadingBall sizes and colors */}
      <div className="mt-shelivery-12 p-shelivery-6 bg-shelivery-card-background rounded-shelivery-md shadow-shelivery-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-shelivery-4 text-shelivery-primary-blue">
          LoadingBall Variations:
        </h2>
        <div className="flex flex-col space-y-shelivery-4">
          <div className="flex items-center space-x-shelivery-4">
            <LoadingBall size="small" color="shelivery-primary-blue" />
            <p className="text-shelivery-text-primary">Small Blue Loader</p>
          </div>
          <div className="flex items-center space-x-shelivery-4">
            <LoadingBall size="medium" color="shelivery-primary-yellow" />
            <p className="text-shelivery-text-primary">Medium Yellow Loader</p>
          </div>
          <div className="flex items-center space-x-shelivery-4">
            <LoadingBall size="large" color="shelivery-warning-orange" />
            <p className="text-shelivery-text-primary">Large Orange Loader</p>
          </div>
          <div className="flex items-center space-x-shelivery-4">
            <LoadingBall size="medium" color="shelivery-error-red" />
            <p className="text-shelivery-text-primary">Medium Red Loader</p>
          </div>
          <div className="flex items-center space-x-shelivery-4">
            <LoadingBall size="medium" color="shelivery-success-green" />
            <p className="text-shelivery-text-primary">Medium Green Loader</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
