import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Linking } from "react-native";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase"; // Assuming Supabase client is configured for Expo
import { colors } from "@/lib/theme";
import AsyncStorage from "@react-native-async-storage/async-storage"; // For localStorage equivalent
import { ChevronLeftIcon, ChevronRightIcon } from 'react-native-heroicons/solid'; // Using react-native-heroicons for icons

interface BannerProps {
    className?: string; // Not directly used in RN, but kept for compatibility
    id?: string;
}

interface BannerData {
    id: string;
    image: string | null;
    link: string | null;
    date: string;
}

export default function Banner({ id }: BannerProps) {
    const [banners, setBanners] = useState<BannerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
    const slideshowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { width: screenWidth } = Dimensions.get('window');

    // Filter out banners without images
    const displayBanners = banners.filter((banner) => banner.image);

    // Fetch banners from Supabase
    useEffect(() => {
        async function fetchBanners() {
            setLoading(true);
            const { data, error } = await supabase
                .from("banner")
                .select("id, image, link, date")
                .order("date", { ascending: false });

            if (error) {
                console.error("Failed to fetch banners:", error);
            } else {
                setBanners(data || []);
            }
            setLoading(false);
        }
        fetchBanners();
    }, []);

    // Automatic slideshow advancement
    useEffect(() => {
        if (slideshowIntervalRef.current) {
            clearInterval(slideshowIntervalRef.current);
        }

        if (displayBanners.length > 1) {
            slideshowIntervalRef.current = setInterval(() => {
                setCurrentBannerIndex((prevIndex) =>
                    (prevIndex + 1) % displayBanners.length
                );
            }, 5000);

            return () => {
                if (slideshowIntervalRef.current) {
                    clearInterval(slideshowIntervalRef.current);
                }
            };
        }
        return () => {};
    }, [displayBanners.length]);

    const handlePrev = () => {
        setCurrentBannerIndex((prevIndex) =>
            prevIndex === 0 ? displayBanners.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentBannerIndex((prevIndex) =>
            (prevIndex + 1) % displayBanners.length
        );
    };

    const deleteAllTutorialData = async () => {
        try {
            await AsyncStorage.removeItem('hasSeenDashboardTutorial');
            await AsyncStorage.removeItem('hasSeenPoolPageTutorial');
            await AsyncStorage.removeItem('hasSeenShopBasketTutorial');
            await AsyncStorage.removeItem('hasSeenChatroomPageTutorial');
            console.log('All tutorial data cleared from AsyncStorage.');
        } catch (e) {
            console.error('Failed to clear tutorial data from AsyncStorage', e);
        }
    };

    if (loading) return <Text style={styles.loadingText}>Loading banners...</Text>;

    if (displayBanners.length === 0) {
        return <Text style={styles.noBannersText}>No new banners</Text>;
    }

    const currentBanner = displayBanners[currentBannerIndex];

    if (!currentBanner) {
        console.warn("No current banner found at index:", currentBannerIndex);
        return <Text style={styles.errorText}>Error displaying banner.</Text>;
    }

    return (
        <View style={styles.container} accessibilityLabelledBy={id}>
            <View style={styles.carouselViewport}>
                <View
                    style={[
                        styles.bannerStrip,
                        { transform: [{ translateX: -currentBannerIndex * screenWidth }] },
                    ]}
                >
                    {displayBanners.map((banner) => (
                        <TouchableOpacity
                            key={banner.id}
                            style={[styles.bannerItem, { width: screenWidth }]}
                            onPress={async () => {
                                if (banner.link) {
                                    await Linking.openURL(banner.link);
                                }
                                deleteAllTutorialData();
                            }}
                            activeOpacity={banner.link ? 0.9 : 1}
                            disabled={!banner.link}
                        >
                            <Image
                                source={{ uri: banner.image! }}
                                style={styles.bannerImage}
                                accessibilityLabel={`Banner for ${banner.id}`}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {displayBanners.length > 1 && (
                    <>
                        <TouchableOpacity
                            onPress={handlePrev}
                            style={[styles.navButton, styles.navButtonLeft]}
                            accessibilityLabel="Previous banner"
                        >
                            <ChevronLeftIcon size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleNext}
                            style={[styles.navButton, styles.navButtonRight]}
                            accessibilityLabel="Next banner"
                        >
                            <ChevronRightIcon size={24} color="white" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {displayBanners.length > 1 && (
                <View style={styles.paginationDots}>
                    {displayBanners.map((_, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.dot,
                                idx === currentBannerIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                            onPress={() => setCurrentBannerIndex(idx)}
                            accessibilityLabel={`Go to banner ${idx + 1}`}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        gap: 12, // gap-3
        marginBottom: 16, // Added for spacing
    },
    loadingText: {
        textAlign: "center",
        color: colors['shelivery-text-secondary'],
    },
    noBannersText: {
        textAlign: "center",
        color: colors['shelivery-text-secondary'],
    },
    errorText: {
        textAlign: "center",
        color: colors['shelivery-error-red'],
    },
    carouselViewport: {
        position: "relative",
        width: "100%",
        aspectRatio: 16 / 9,
        borderRadius: 20,
        overflow: "hidden",
    },
    bannerStrip: {
        flexDirection: "row",
        height: "100%",
        transitionProperty: "transform",
        transitionDuration: "700ms",
        transitionTimingFunction: "ease-in-out",
    },
    bannerItem: {
        flexShrink: 0,
        height: "100%",
        backgroundColor: "#f3f3f3",
        justifyContent: "center",
        alignItems: "center",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    navButton: {
        position: "absolute",
        top: "50%",
        transform: [{ translateY: -12 }], // Half of icon size
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: 8,
        borderRadius: 9999, // rounded-full
        zIndex: 10,
    },
    navButtonLeft: {
        left: 8,
    },
    navButtonRight: {
        right: 8,
    },
    paginationDots: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8, // gap-2
        marginTop: 8, // mt-2
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: colors['shelivery-primary-yellow'],
    },
    inactiveDot: {
        backgroundColor: colors['shelivery-text-disabled'], // Using a gray color for inactive dots
    },
});
