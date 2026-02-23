import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  Animated,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRef } from "react";
import { useRouter } from "expo-router";
import AnimatedRN, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window"),
  cardWidth = width * 0.85;

const DATA = [
  {
    id: "1",
    title: "Welcome!",
    description: "The finest task planner for your day to day activities",
  },
  {
    id: "2",
    title: "Discover",
    description:
      "Discover minimal and wide range features to up your usage of the planner in your daily activities",
  },
  {
    id: "3",
    title: "Enjoy",
    description: "Join in to find a task arrangement means",
    button: "Join in",
  },
];

const Pagination = ({ scrollX }: { scrollX: any }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
        alignSelf: "center",
      }}
    >
      {DATA.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.8, 1.4, 0.8],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.4, 1, 0.4],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            key={index}
            style={{
              height: 8,
              width: 8,
              borderRadius: 4,
              backgroundColor: "coral",
              marginHorizontal: 6,
              opacity,
              transform: [{ scale }],
            }}
          />
        );
      })}
    </View>
  );
};

const Index = () => {
  const scrollX = useRef(new Animated.Value(0)).current,
    router = useRouter(),
    scaleX = useSharedValue(1),
    scaleStyle = useAnimatedStyle(() => ({
      transform: [
        {
          scale: scaleX.value,
        },
      ],
    }));

  const onPressIn = () => {
    scaleX.value = withTiming(0.8, { duration: 100 });
  };

  const onPressOut = () => {
    scaleX.value = withSpring(1);
  };

  return (
    <ImageBackground
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
      resizeMode="cover"
      source={require("../../assets/images/Intro.jpg")}
    >
      {/* Add a subtle dark overlay so white text always pops */}
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* 1. Refined Header - Centered and Balanced */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 40,
            }}
          >
            <Image
              style={{
                borderRadius: 25,
                width: 60,
                height: 60,
                backgroundColor: "coral",
                marginRight: 15,
              }}
              source={require("./../../assets/images/logo.png")}
            />
            <Text
              style={{
                fontSize: 42,
                fontWeight: "800",
                color: "white", // White often looks cleaner than coral on dark backgrounds
                letterSpacing: -1,
              }}
            >
              Inclyne
            </Text>
          </View>

          {/* 2. Glassmorphism Card Container */}
          <View
            style={{
              width: "90%",
              height: 250,
              borderRadius: 40,
              alignSelf: "center",
              position: "absolute",
              bottom: 50,
              backgroundColor: "rgba(255, 255, 255, 0.85)", // Semi-transparent white
              paddingTop: 30,
              paddingBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.2,
              shadowRadius: 30,
              elevation: 10,
              overflow: "hidden",
            }}
          >
            <Animated.FlatList
              data={DATA}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              snapToAlignment="center"
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false },
              )}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: width * 0.9, // Match the parent container width
                    paddingHorizontal: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "transparent", // Semi-transparent white
                  }}
                >
                  <Text
                    style={{
                      fontSize: 35,
                      fontWeight: "800",
                      color: "#1A1A1A",
                      marginBottom: 15,
                      textAlign: "center",
                      bottom: 20,
                    }}
                  >
                    {item.title}
                  </Text>
                  {!item.description.includes("Join in to find") && (
                    <Text
                      style={{
                        fontSize: 17,
                        textAlign: "center",
                        color: "#555",
                        lineHeight: 24,
                        fontWeight: "400",
                        bottom: 20,
                      }}
                    >
                      {item.description}
                    </Text>
                  )}

                  {item.button && (
                    <Pressable
                      onPressIn={onPressIn}
                      onPressOut={onPressOut}
                      onPress={() => router.push("/(Auth)/Authentication")}
                      style={{ marginTop: 30 }}
                    >
                      <AnimatedRN.View
                        style={[
                          {
                            paddingVertical: 10,
                            paddingHorizontal: 30,
                            bottom: 30,
                            backgroundColor: "coral",
                            borderRadius: 20,
                            shadowColor: "coral",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 10,
                          },
                          scaleStyle,
                        ]}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 17,
                            fontWeight: "700",
                          }}
                        >
                          {item.button}
                        </Text>
                      </AnimatedRN.View>
                    </Pressable>
                  )}
                </View>
              )}
            />

            {/* 3. Pagination Dots - Lifted slightly */}
            <View style={{ marginBottom: 10 }}>
              <Pagination scrollX={scrollX} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
};

export default Index;
