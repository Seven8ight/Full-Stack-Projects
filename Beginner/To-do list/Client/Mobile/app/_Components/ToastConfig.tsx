// App.jsx
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

/*
  1. Create the config
*/
export const toastConfig: ToastConfig = {
  /*
    Overwrite 'success' type,
    by modifying the existing `BaseToast` component
  */
  success: (props: Object) => (
    <BaseToast
      {...props}
      style={{ width: "90%", borderLeftColor: "green" }}
      contentContainerStyle={{ paddingHorizontal: 15, borderRadius: 30 }}
      text1Style={{
        fontSize: 18,
        fontWeight: "400",
        fontFamily: "serif",
      }}
      text2Style={{
        fontSize: 14,
      }}
    />
  ),
  /*
    Overwrite 'error' type,
    by modifying the existing `ErrorToast` component
  */
  error: (props: Object) => (
    <ErrorToast
      {...props}
      style={{ width: "90%", borderLeftColor: "red" }}
      contentContainerStyle={{ paddingHorizontal: 15, borderRadius: 30 }}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
  //   tomatoToast: ({ text1, props }: { text1: string; props: any }) => (
  //     <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
  //       <Text>{text1}</Text>
  //       <Text>{props.uuid}</Text>
  //     </View>
  //   ),
};

/*
  2. Pass the config as prop to the Toast component instance
*/
