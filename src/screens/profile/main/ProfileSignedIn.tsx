import { Signal, useSignal } from "@preact/signals-react";
import auth from "@react-native-firebase/auth";
import { Button } from "@src/components/Button";
import { getUserData, setUserData, UserDataType } from "@src/services/firebase";
import { getUserSignal } from "@src/signals/userSignal";
import { colors } from "@src/styles/tailwindColors";
import React, { Fragment, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
} from "react-native";
import parsePhoneNumber from "libphonenumber-js";
import { PhoneNumber } from "libphonenumber-js/types";
import { getLikedMoviesSignal } from "@src/signals/likedMoviesSignal";

const style = {
  title:
    "text-lg my-3 text-center font-bold text-quaternary_light dark:text-quaternary_dark",
  field:
    "text-lg p-2 mx-5 my-3 text-center rounded-lg shadow-lg bg-primary_light text-quaternary_light shadow-black dark:bg-primary_dark dark:text-quaternary_dark dark:shadow-white",
  button: {
    button:
      "mx-8 rounded-md p-3 my-2 shadow-lg bg-primary_light shadow-black dark:bg-primary_dark dark:shadow-white",
    text: "text-lg font-bold text-center text-quaternary_light dark:text-quaternary_dark",
  },
};

const saveData = (
  userId: string,
  displayNameSignal: Signal<string>,
  surnameSignal: Signal<string>,
  phoneNumberSignal: Signal<string>,
  genderSignal: Signal<string>,
  dateOfBirthSignal: Signal<string>,
  loadingSaveSignal: Signal<boolean>,
): void => {
  let parsedPhoneNumber: PhoneNumber | undefined;

  if (phoneNumberSignal.value != "") {
    parsedPhoneNumber = parsePhoneNumber(phoneNumberSignal.value, "ES");
    if (!parsedPhoneNumber?.isValid() || !parsedPhoneNumber?.isPossible()) {
      Alert.alert(
        "Invalid phone number.",
        "Check if phone number is correct and try again.",
      );
      return;
    }
  }

  loadingSaveSignal.value = true;

  const data: UserDataType = {
    displayName: displayNameSignal.value,
    surname: surnameSignal.value,
    phoneNumber: parsedPhoneNumber?.number ?? "",
    gender: genderSignal.value,
    dateOfBirth: dateOfBirthSignal.value,
    likedMovies: getLikedMoviesSignal.value,
  };

  const handleSetUserDataSuccess = (): void => {
    Alert.prompt("Data saved successfully.");
  };

  const handleSetUserDataFailure = (): void => {
    Alert.alert(
      "There was an error while saving your data.",
      "Please, try again later.",
    );
  };

  const handleSetUserDataFinally = (): void => {
    phoneNumberSignal.value = parsedPhoneNumber?.number ?? "";
    loadingSaveSignal.value = false;
  };

  setUserData(userId, data)
    .then(handleSetUserDataSuccess)
    .catch(handleSetUserDataFailure)
    .finally(handleSetUserDataFinally);
};

const ProfileSignedIn = (): React.JSX.Element => {
  const loadingSignal = useSignal(false);
  const loadingSaveSignal = useSignal(false);

  const displayNameSignal = useSignal("");
  const surnameSignal = useSignal("");
  const phoneNumberSignal = useSignal("");
  const genderSignal = useSignal("");
  const dateOfBirthSignal = useSignal("");

  const isLight = useColorScheme() === "light";

  const handleOnDisplayNameTextChanged = (text: string): void => {
    displayNameSignal.value = text;
  };

  const handleOnSurnameTextChanged = (text: string): void => {
    surnameSignal.value = text;
  };

  const handleOnPhoneNumberTextChanged = (text: string): void => {
    phoneNumberSignal.value = text;
  };

  const handleOnGenderTextChanged = (text: string): void => {
    genderSignal.value = text;
  };

  const handleOnDateOfBirthTextChanged = (text: string): void => {
    dateOfBirthSignal.value = text;
  };

  const handleOnSignoutButtonPress = (): void => {
    const handleSingoutFailure = () => {
      Alert.alert(
        "There was an error while signing your out.",
        "Please, try again later.",
      );
    };

    auth().signOut().catch(handleSingoutFailure);
  };

  const handleOnSaveButtonPress = (): void => {
    saveData(
      getUserSignal.value!!.uid,
      displayNameSignal,
      surnameSignal,
      phoneNumberSignal,
      genderSignal,
      dateOfBirthSignal,
      loadingSaveSignal,
    );
  };

  const handleCheckEmailOnPress = (): void => {
    getUserSignal.value!!.reload();
  };

  useEffect(() => {
    if (!getUserSignal.value) return;
    loadingSignal.value = true;

    const handleGetUserDataSuccess = (fetchedUserData: UserDataType): void => {
      displayNameSignal.value = fetchedUserData.displayName;
      surnameSignal.value = fetchedUserData.surname;
      phoneNumberSignal.value = fetchedUserData.phoneNumber;
      genderSignal.value = fetchedUserData.gender;
      dateOfBirthSignal.value = fetchedUserData.dateOfBirth;
      getLikedMoviesSignal.value = fetchedUserData.likedMovies;
    };

    const handleGetUserDataFinally = (): void => {
      loadingSignal.value = false;
    };

    getUserData(getUserSignal.value.uid)
      .then(handleGetUserDataSuccess)
      .finally(handleGetUserDataFinally);
  }, [getUserSignal.value]);

  return (
    <ScrollView>
      {getUserSignal.value && !loadingSignal.value ? (
        getUserSignal.value?.emailVerified ? (
          <Fragment>
            <Text className={style.title}>Display name</Text>
            <TextInput
              className={style.field}
              value={displayNameSignal.value}
              onChangeText={handleOnDisplayNameTextChanged}
              textContentType="name"
            />
            <Text className={style.title}>Surname</Text>
            <TextInput
              className={style.field}
              value={surnameSignal.value}
              onChangeText={handleOnSurnameTextChanged}
              textContentType="name"
            />
            <Text className={style.title}>Phone number</Text>
            <TextInput
              className={style.field}
              value={phoneNumberSignal.value}
              onChangeText={handleOnPhoneNumberTextChanged}
              textContentType="telephoneNumber"
              keyboardType="phone-pad"
            />
            <Text className={style.title}>Gender</Text>
            <TextInput
              className={style.field}
              value={genderSignal.value}
              onChangeText={handleOnGenderTextChanged}
            />
            <Text className={style.title}>Date of birth</Text>
            <TextInput
              className={style.field}
              value={dateOfBirthSignal.value}
              onChangeText={handleOnDateOfBirthTextChanged}
              textContentType="birthdate"
            />
            <Button
              text="Save"
              buttonClassName={style.button.button}
              textClassName={style.button.text}
              onPress={handleOnSaveButtonPress}
              loading={loadingSaveSignal.value}
            />
          </Fragment>
        ) : (
          <Fragment>
            <Text className={style.title}>
              You must verify your email to start using the app
            </Text>
            <Button
              text="Check email verified"
              buttonClassName={style.button.button}
              textClassName={style.button.text}
              onPress={handleCheckEmailOnPress}
            />
          </Fragment>
        )
      ) : (
        <ActivityIndicator
          size="large"
          color={isLight ? colors.quaternary_light : colors.quaternary_dark}
        />
      )}
      <Button
        text="Sign-Out"
        buttonClassName={style.button.button}
        textClassName={style.button.text}
        onPress={handleOnSignoutButtonPress}
      />
    </ScrollView>
  );
};

export { ProfileSignedIn };
