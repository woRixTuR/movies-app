import {
  createMaterialTopTabNavigator,
  MaterialTopTabNavigationOptions,
} from "@react-navigation/material-top-tabs";
import React, { Fragment, useEffect } from "react";
import { colors } from "@src/styles/tailwindColors";
import {
  Alert,
  Image,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { DocumentsScreen } from "@src/screens/profile/DocumentsScreen";
import { ProfileStackNav } from "@src/navigations/ProfileStackNav";
import { Signal, useSignal } from "@preact/signals-react";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerResult, MediaTypeOptions } from "expo-image-picker";
import { getProfilePicture, setProfilePicture } from "@src/services/firebase";
import { getUserSignal } from "@src/signals/userSignal";

const Tab = createMaterialTopTabNavigator();

const style = {
  view: "bg-primary_light dark:bg-primary_dark",
  image:
    "bg-quaternary_light dark:bg-quaternary_dark w-20 h-20 mx-auto mt-5 rounded-full",
};

const getOptions = (
  isLight: boolean,
  title: string,
): MaterialTopTabNavigationOptions => {
  return {
    title: title,
    tabBarStyle: isLight
      ? {
          backgroundColor: colors.primary_light,
          shadowColor: "black",
        }
      : {
          backgroundColor: colors.primary_dark,
          shadowColor: "white",
        },
    tabBarLabelStyle: isLight
      ? { color: colors.quaternary_light, fontWeight: "bold" }
      : { color: colors.quaternary_dark, fontWeight: "bold" },
  };
};

const selectPicture = (
  userId: string,
  profilePictureSignal: Signal<string | undefined>,
): void => {
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: MediaTypeOptions.Images,
    selectionLimit: 1,
  };

  ImagePicker.launchImageLibraryAsync(options).then(
    (result: ImagePickerResult): void => {
      if (result.canceled) return;
      if (result.assets[0].fileName?.split(".").pop() != "jpg") return;

      const handleOnProfilePictureSetSuccess = (): void => {
        profilePictureSignal.value = result.assets[0].uri;
      };

      const handleOnProfilePictureSetFailure = (): void => {
        Alert.alert(
          "There was an error while setting your profile photo.",
          "Please, try again later.",
        );
      };

      setProfilePicture(userId, result.assets[0])
        .then(handleOnProfilePictureSetSuccess)
        .catch(handleOnProfilePictureSetFailure);
    },
  );
};

const ProfileTabNav = (): React.JSX.Element => {
  const profilePictureSignal = useSignal<string | undefined>(undefined);

  const isLight = useColorScheme() === "light";

  const handleOnImagePress = (): void => {
    selectPicture(getUserSignal.value!!.uid, profilePictureSignal);
  };

  useEffect(() => {
    if (!getUserSignal.value) {
      profilePictureSignal.value = undefined;
      return;
    }

    const handleGetProfilePictureSuccess = (url: string): void => {
      profilePictureSignal.value = url;
    };

    const handleGetProfilePictureFaillure = (): void => {
      profilePictureSignal.value = undefined;
    };

    getProfilePicture(getUserSignal.value.uid)
      .then(handleGetProfilePictureSuccess)
      .catch(handleGetProfilePictureFaillure);
  }, [getUserSignal.value]);

  return (
    <Fragment>
      {getUserSignal.value?.emailVerified && (
        <View className={style.view}>
          <TouchableOpacity onPress={handleOnImagePress}>
            <Image
              source={{ uri: profilePictureSignal.value }}
              className={style.image}
            />
          </TouchableOpacity>
        </View>
      )}
      <Tab.Navigator>
        <Tab.Screen
          name="ProfileInfoTab"
          component={ProfileStackNav}
          options={getOptions(isLight, "Info")}
        />
        <Tab.Screen
          name="ProfileDocumentsTab"
          component={DocumentsScreen}
          options={getOptions(isLight, "Documents")}
        />
      </Tab.Navigator>
    </Fragment>
  );
};

export { ProfileTabNav };
