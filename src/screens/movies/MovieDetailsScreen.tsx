import { Signal, useSignal } from "@preact/signals-react";
import { useRoute } from "@react-navigation/native";
import { CommentArea } from "@src/components/CommentArea";
import { LikeButton } from "@src/components/LikeButton";
import { ListCard } from "@src/components/ListCard";
import { TextCard } from "@src/components/TextCard";
import { getMovieByIdApi, Movie } from "@src/services/altenHybridApi";
import React, { Fragment, useCallback, useEffect } from "react";
import { Image, RefreshControl, ScrollView, Text } from "react-native";
import { getUserSignal, UserType } from "@src/signals/userSignal";
import { MoviesNavProps } from "@src/navigations/MoviesNav";

const style = {
  scrollView: "flex-1 bg-secondary_light dark:bg-secondary_dark",
  title:
    "text-3xl font-bold text-center m-2.5 text-quaternary_light dark:text-quaternary_dark",
  image: "aspect-square",
  button: {
    button:
      "ml-auto mr-5 shadow-lg rounded-lg p-2 flex-row bg-primary_light shadow-black dark:bg-primary_dark dark:shadow-white",
    image: "w-5 h-5 mr-2",
    text: "text-quaternary_light dark:text-quaternary_dark",
  },
};

const MovieDetailsScreen = (): React.JSX.Element => {
  const movie: Signal<Movie | null> = useSignal<Movie | null>(null);
  const refreshing: Signal<boolean> = useSignal<boolean>(false);

  const { movieId }: MoviesNavProps = useRoute().params as MoviesNavProps;

  const localUser: UserType = getUserSignal.value;

  const onRefresh = useCallback((): void => {
    refreshing.value = true;
    getMovieByIdApi(movieId).then((fetchedMovie: Movie): void => {
      movie.value = fetchedMovie;
    });
    refreshing.value = false;
  }, []);

  useEffect((): void => {
    getMovieByIdApi(movieId).then((fetchedMovie: Movie): void => {
      movie.value = fetchedMovie;
    });
  }, []);

  return (
    <ScrollView
      className={style.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing.value} onRefresh={onRefresh} />
      }
    >
      {movie.value && (
        <Fragment>
          <Image
            source={{ uri: movie.value.pictureUrl }}
            className={style.image}
            resizeMode="cover"
          />
          <Text className={style.title}>{movie.value.name}</Text>
          {localUser && (
            <LikeButton
              movieId={movie.value?.id}
              movieUserLiked={movie.value?.userLiked ?? []}
              userId={localUser.uid}
            />
          )}
          <TextCard title={"Description"} content={movie.value.description} />
          <ListCard title={"Actors"} content={movie.value.actors} />
          <ListCard title={"Categories"} content={movie.value.categories} />
          <ListCard
            title={"Other data"}
            content={[
              `Duration: ${movie.value.duration}`,
              `Rate: ${movie.value.rating}/5`,
              `Likes: ${movie.value.likes}`,
            ]}
          />
          <CommentArea
            movieId={movie.value?.id}
            movieRatings={movie.value?.ratings}
          />
        </Fragment>
      )}
    </ScrollView>
  );
};

export { MovieDetailsScreen };
