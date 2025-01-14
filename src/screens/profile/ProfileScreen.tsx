import { ProfileSignedIn } from "@src/screens/profile/main/ProfileSignedIn";
import { ProfileSignedOut } from "@src/screens/profile/main/ProfileSignedOut";
import { getUserSignal } from "@src/signals/userSignal";
import { View } from "react-native";
import React from "react";

const style = {
  view: "flex-1 justify-center bg-secondary_light dark:bg-secondary_dark",
};

const ProfileScreen = (): React.JSX.Element => {
  return (
    <View className={style.view}>
      {!getUserSignal.value ? <ProfileSignedOut /> : <ProfileSignedIn />}
    </View>
  );
};

export { ProfileScreen };
