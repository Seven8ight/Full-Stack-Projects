import { Platform, StyleSheet } from "react-native";

export const Styles = StyleSheet.create({
  TabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: Platform.select({ ios: 40, android: 35 }),
    padding: 15,
    left: Platform.select({ ios: 65, android: 45 }),
    width: Platform.select({ ios: "70%", android: "75%" }),
    backgroundColor: "white",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 10,
    shadowRadius: 3,
    shadowColor: "black",
    shadowOpacity: 0.08,
    borderRadius: 30,
  },
  TabBarItem: {
    alignItems: "center",
  },

  //Home Page
  Header: {
    top: 15,
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 10,
    alignItems: "center",

    backgroundColor: "rgba(250,250,250,0.75)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 10,
    shadowRadius: 3,
    shadowColor: "black",
    shadowOpacity: 0.08,
    borderRadius: 30,
  },
});
