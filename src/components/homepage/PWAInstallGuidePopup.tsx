// components/homepage/PWAInstallGuidePopup.tsx
import React, { useState, useEffect } from 'react';

// Define the types for the props of PWAInstallGuidePopup
interface PWAInstallGuidePopupProps {
    isOpen: boolean;
    onClose: () => void; // onClose is a function that takes no arguments and returns void
}

// PWAInstallGuidePopup Component
const PWAInstallGuidePopup: React.FC<PWAInstallGuidePopupProps> = ({ isOpen, onClose }) => {
    // State to determine which instructions to show (Android or iOS)
    const [isIOS, setIsIOS] = useState<boolean>(false); // Explicitly type useState for boolean

    // useEffect hook to detect OS on component mount
    useEffect(() => {
        // Function to detect the operating system
        const getOS = (): string => { // Explicitly type the return of getOS
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera; // Cast window to any to access opera if needed

            // iOS detection
            if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) { // Cast window to any to access MSStream if needed
                return 'iOS';
            }
            // Android detection
            if (/android/i.test(userAgent)) {
                return 'Android';
            }
            // Other platforms (desktop, etc.)
            return 'Other';
        };

        // Set the isIOS state based on the detected OS
        setIsIOS(getOS() === 'iOS');
    }, []); // Empty dependency array ensures this runs only once on mount

    // Function to close pop-up if clicked outside the content
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => { // Explicitly type the event
        if ((event.target as HTMLElement).id === 'pwaPopupOverlay') { // Cast event.target to HTMLElement
            onClose(); // Call the onClose prop provided by the parent
        }
    };

    // SVG for iOS Share Icon
    const iOSShareIcon = (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className="inline-block w-5 h-5 align-middle mr-2">
            <path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'></path>
            <polyline points='16 6 12 2 8 6'></polyline>
            <line x1='12' y1='2' x2='12' y2='15'></line>
        </svg>
    );

    // SVG for Android Menu Icon (3 dots)
    const androidMenuIcon = (
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' className="inline-block w-5 h-5 align-middle mr-2">
            <circle cx='12' cy='12' r='1.5'></circle>
            <circle cx='12' cy='5' r='1.5'></circle>
            <circle cx='12' cy='19' r='1.5'></circle>
        </svg>
    );

    return (
        // PWA Install Guide Pop-up Overlay
        <div
            id="pwaPopupOverlay"
            className={`fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            onClick={handleOverlayClick}
        >
            <div
                className={`bg-white rounded-2xl p-8 max-w-lg w-11/12 shadow-2xl relative transition-transform transition-opacity duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}
            >
                <button
                    onClick={onClose} // Call the onClose prop
                    className="absolute top-4 right-4 bg-none border-none text-gray-400 text-3xl cursor-pointer hover:text-gray-600 transition-colors duration-200"
                >
                    &times;
                </button>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add to Home Screen</h2>

                {/* Conditional rendering based on OS */}
                {isIOS ? (
                    // iOS Instructions
                    <div className="platform-instructions">
                        <p className="text-gray-700 mb-4 text-lg">
                            To install this app on your device, follow these steps:
                        </p>
                        <ol className="list-decimal list-inside text-gray-700 space-y-4 text-base">
                            <li>Tap the <span className="font-semibold">Share</span> icon {iOSShareIcon}at the bottom of your browser screen.</li>
                            <li>Scroll down and select "<span className="font-semibold">Add to Home Screen</span>".</li>
                            <li>Tap "<span className="font-semibold">Add</span>" in the top right corner.</li>
                        </ol>
                    </div>
                ) : (
                    // Android Instructions (Default for Android and other platforms)
                    <div className="platform-instructions">
                        <p className="text-gray-700 mb-4 text-lg">
                            To install this app on your Android device, follow these steps:
                        </p>
                        <ol className="list-decimal list-inside text-gray-700 space-y-4 text-base">
                            <li>Tap the <span className="font-semibold">Menu</span> icon (usually {androidMenuIcon} three vertical dots) in your browser's toolbar.</li>
                            <li>Select "<span className="font-semibold">Add to Home screen</span>" from the menu options.</li>
                            <li>Confirm by tapping "<span className="font-semibold">Add</span>" in the pop-up.</li>
                        </ol>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-8 text-center">
                    This will create a shortcut on your home screen for quick access.
                </p>
            </div>
        </div>
    );
};

export default PWAInstallGuidePopup;
