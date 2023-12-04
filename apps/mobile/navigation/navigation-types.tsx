/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import {
  CompositeScreenProps,
  NavigationProp,
  NavigatorScreenParams,
  RouteProp,
} from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { FeedQuery, FlattenedCast } from "@discove/util/types";

/** Use this to flatten complex typescript types to make them a bit more human friendly */
type Id<T> = {} & {
  [P in keyof T]: Id<T[P]>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends AuthedParamList {}
  }
}

export type AuthParams = {
  Cast: {
    castHash: string;
  };
  FiltersModal: FeedQuery;
  SaveCoveForm: FeedQuery;
  FullScreenImageModal: {
    imageUrl: string;
  };
  Bookmarks: {};
  AutocompleteSearch: {};
  Home: {};
  Settings: {};
  Profile: {
    username: string | undefined;
    fid?: string;
  } & FeedQuery;
  Thread: { threadHash: string; castHash: string };
  NewCastModal: { replyToCast?: FlattenedCast };
  RoutedFeed: FeedQuery;
  NamedFeed: { username: string; feedname: string } & FeedQuery;
};

type NoAuthParams = {
  Authenticate: {
    mode: "login" | "magic" | "reset" | "signup" | "check-email";
    message?: string;
  };
};

type AuthNoSignerParams = {
  CreateFarcasterSigner: {};
};

export type HomeTabParamList = {
  FiltersModal: AuthParams["FiltersModal"];
  NewCastModal: AuthParams["NewCastModal"];
  FullScreenImageModal: AuthParams["FullScreenImageModal"];

  Bookmarks: AuthParams["Bookmarks"];
  Profile: AuthParams["Profile"];
  Cast: AuthParams["Cast"];
  RoutedFeed: AuthParams["RoutedFeed"];
  NamedFeed: AuthParams["NamedFeed"];
  Settings: AuthParams["Settings"];
  Thread: AuthParams["Thread"];
  SaveCoveForm: AuthParams["SaveCoveForm"];
};

export type MainBottomTabParamList = {
  Home: NavigatorScreenParams<HomeTabParamList>;
  AutocompleteSearch: undefined;
  Coves: AuthParams;
  Notifications: undefined;
};

export type NoAuthParamList = {
  Authenticate: NoAuthParams["Authenticate"];
};

export type AuthedNoSignerParamList = {
  CreateFarcasterSigner: AuthNoSignerParams["CreateFarcasterSigner"];
};

export type AuthedParamList = {
  Root: NavigatorScreenParams<MainBottomTabParamList>;
  Modal: undefined;
  NotFound: undefined;
};

export type AuthedNoSignerProps<Screen extends keyof AuthedNoSignerParamList> =
  NativeStackScreenProps<AuthedNoSignerParamList, Screen>;

export type NoAuthScreenProps<Screen extends keyof NoAuthParamList> =
  NativeStackScreenProps<NoAuthParamList, Screen>;

export type AuthedScreenProps<Screen extends keyof AuthedParamList> =
  NativeStackScreenProps<AuthedParamList, Screen>;

export type MainBottomTabScreenProps<
  Screen extends keyof MainBottomTabParamList
> = CompositeScreenProps<
  BottomTabScreenProps<MainBottomTabParamList, Screen>,
  AuthedScreenProps<"Root">
>;

export type HomeTabScreenProps<Screen extends keyof HomeTabParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeTabParamList, Screen>,
    MainBottomTabScreenProps<"Home">
  >;

export type NavigationProps = NativeStackNavigationProp<MainBottomTabParamList>;

export type HomeTabNavigationProps =
  NativeStackNavigationProp<HomeTabParamList>;
// Use as `const navigation = useNavigation<HomeTabNavigationProps>();`
export type HomeTabNavigationType = NavigationProp<AuthedParamList>;

export type NamedFeedScreenRouteProp = RouteProp<HomeTabParamList, "NamedFeed">;

export type ProfileScreenRouteProp = RouteProp<HomeTabParamList, "Profile">;

export type RoutedFeedScreenRouteProp = RouteProp<
  HomeTabParamList,
  "RoutedFeed"
>;
