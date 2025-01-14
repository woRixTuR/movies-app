import database from "@react-native-firebase/database";
import storage from "@react-native-firebase/storage";
import { ImagePickerAsset } from "expo-image-picker";
import { DocumentPickerAsset } from "expo-document-picker";

type FileType = {
  uri: string;
  name: string;
  size: number;
  type: string | null | undefined;
};

type FolderType = {
  name: string;
};

type DocumentListType = (FileType | FolderType)[];

type UserDataType = {
  displayName: string;
  surname: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  likedMovies: number;
};

const setUserData = async (
  uid: string,
  userData: UserDataType,
): Promise<void | never> => {
  const url = `/users/${uid}`;

  try {
    await database().ref(url).set(userData);
  } catch (error) {
    console.error("There was an error while setting your user data: %s", error);

    throw error;
  }
};

const getUserData = async (uid: string): Promise<UserDataType | never> => {
  const url = `/users/${uid}`;

  try {
    const data = await database().ref(url).once("value");

    return data.val() as UserDataType;
  } catch (error) {
    console.error("There was an error while getting your user data: %s", error);

    throw error;
  }
};

const setMovieLiked = async (uid: string, movieLiked: number) => {
  const url = `/users/${uid}`;

  const data = {
    likedMovies: movieLiked,
  };

  try {
    await database().ref(url).update(data);
  } catch (error) {
    console.error("There was an error while setting your user data: %s", error);

    throw error;
  }
};

const setProfilePicture = async (
  uid: string,
  asset: ImagePickerAsset,
): Promise<void | never> => {
  const url = `ProfilePictures/${uid}.jpg`;

  try {
    const response = await fetch(asset.uri);
    const blob = await response.blob();

    await storage().ref(url).put(blob);
  } catch (error) {
    console.error(
      "There was an error while setting your profile picture: %s",
      error,
    );

    throw error;
  }
};

const getProfilePicture = async (uid: string): Promise<string> => {
  const url = `ProfilePictures/${uid}.jpg`;

  try {
    return await storage().ref(url).getDownloadURL();
  } catch (error) {
    console.error(
      "There was an error while getting your profile picture: %s",
      error,
    );

    throw error;
  }
};

const addFileToStorage = async (
  uid: string,
  file: DocumentPickerAsset,
  route: string,
) => {
  const url = `Files/${uid}${route}${file.name}`;

  try {
    const response = await fetch(file.uri);
    const blob = await response.blob();

    await storage().ref(url).put(blob);
  } catch (error) {
    console.error("There was an error while uploading your file: %s", error);

    throw error;
  }
};

const createFolder = async (uid: string, route: string, folderName: string) => {
  const url = `Files/${uid}${route}${folderName}/.hidden`;

  try {
    await storage().ref(url).putString("");
  } catch (error) {
    console.error("There was an error while creating your folder: %s", error);

    throw error;
  }
};

const getFilesFromStorage = async (uid: string, route: string) => {
  const url = `Files/${uid}${route}`;

  try {
    const listResult = await storage().ref(url).listAll();

    const documents: DocumentListType = [];

    for (const item of listResult.items) {
      if (item.name != ".hidden") {
        const metadata = await item.getMetadata();
        const file: FileType = {
          uri: await item.getDownloadURL(),
          name: item.name.split(".")[0],
          size: metadata.size,
          type: metadata.contentType,
        };

        documents.push(file);
      }
    }

    for (const item of listResult.prefixes) {
      const folder: FolderType = {
        name: item.name,
      };

      documents.push(folder);
    }

    return documents;
  } catch (error) {
    console.error("There was an error while getting your files: %s", error);
    throw error;
  }
};

export {
  UserDataType,
  getUserData,
  setUserData,
  setProfilePicture,
  getProfilePicture,
  addFileToStorage,
  getFilesFromStorage,
  createFolder,
  setMovieLiked,
  DocumentListType,
  FileType,
  FolderType,
};
