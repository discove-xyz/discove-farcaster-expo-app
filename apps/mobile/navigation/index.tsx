/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { ColorSchemeName, Share } from "react-native";
import AuthenticateScreen from "../screens/LoggedOut/AuthenticateScreen";

import Colors, {
  NavigationDarkTheme,
  NavigationLightTheme,
} from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import ModalScreen from "../screens/ModalScreen";
import NotFoundScreen from "../screens/NotFoundScreen";
import {
  NoAuthParamList,
  MainBottomTabParamList,
  MainBottomTabScreenProps,
  HomeTabParamList,
  AuthedParamList,
  AuthedScreenProps,
  AuthedNoSignerParamList,
} from "./navigation-types";
import LinkingConfiguration from "./LinkingConfiguration";
import CovesScreen from "../screens/CovesScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { Icon, TablerIconName } from "../components/Icon";
import ProfileScreen from "../screens/ProfileScreen";
import CastScreen from "../screens/CastScreen";
import RoutedFeedScreen from "../screens/RoutedFeedScreen";
import NamedFeedScreen from "../screens/NamedFeedScreen";
import { Filters, FiltersModal } from "../components/Filters";
import { PressableRaw } from "../components/Pressable";
import { NewCastModal } from "../components/NewCastModal";
import ThreadScreen from "../screens/ThreadScreen";
import AutocompleteSearchScreen from "../screens/AutocompleteSearchScreen";
import { useFCNotificationsCount } from "@discove/ui/useFCNotifications";
import { RoutedFeedHeaderLeft } from "../components/RoutedFeedHeader";
import { SaveCoveForm } from "../components/SaveCoveForm";
import { FeedHeader } from "../components/Feed";
import { PostHogWrappedProvider } from "../contexts/PostHogWrappedProvider";
import * as Haptics from "expo-haptics";
import BookmarksScreen from "../screens/BookmarksScreen";
import { FullScreenImageModal } from "../components/FullScreenImageModal";
import CreateFarcasterSignerScreen from "../screens/CreateFarcasterSignerScreen";
import { TouchableHighlight } from "../components/TouchableHighlight";
import { H1 } from "../components/Text";
import { View } from "../components/View";

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const AuthedNoSigner = createNativeStackNavigator<AuthedNoSignerParamList>();
const NoAuth = createNativeStackNavigator<NoAuthParamList>();
const Authed = createNativeStackNavigator<AuthedParamList>();
const HomeTab = createNativeStackNavigator<HomeTabParamList>();
const MainBottomTab = createBottomTabNavigator<MainBottomTabParamList>();

/**
 * High Level overview of Navigation Nesting in Authed view
 *
 *  <AuthedNavigator>
 *      <MainBottomTabNavigator>
 *        <HomeTabNavigator>
 *          <SaveCoveForm />
 *          <NewCastModal />
 *          <FiltersModal />
 *          <RoutedFeed />
 *          <NamedFeed />
 *          <Profile />
 *          <Settings />
 *          <Thread />
 *          <Cast />
 *        </HomeTabNavigator>
 *        <AutocompleteSearch />
 *        <CovesScreen />
 *        <NotificationsScreen />
 *      </MainBottomTabNavigator>
 *      <NotFoundScreen />
 *      <ModalScrreen />
 *  </AuthedNavigator>
 */

export function AuthedButNoSignerNavigator({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={
        colorScheme === "dark" ? NavigationDarkTheme : NavigationLightTheme
      }
    >
      <PostHogWrappedProvider>
        <AuthedNoSigner.Navigator initialRouteName="CreateFarcasterSigner">
          <AuthedNoSigner.Screen
            name="CreateFarcasterSigner"
            component={CreateFarcasterSignerScreen}
            options={{ headerShown: false }}
          />
        </AuthedNoSigner.Navigator>
      </PostHogWrappedProvider>
    </NavigationContainer>
  );
}

export function NoAuthNavigation({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={
        colorScheme === "dark" ? NavigationDarkTheme : NavigationLightTheme
      }
    >
      <PostHogWrappedProvider>
        <NoAuthNavigator />
      </PostHogWrappedProvider>
    </NavigationContainer>
  );
}

export function AuthedNavigator({
  colorScheme,
}: {
  colorScheme: ColorSchemeName;
}) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={
        colorScheme === "dark" ? NavigationDarkTheme : NavigationLightTheme
      }
    >
      <PostHogWrappedProvider>
        <Authed.Navigator>
          <Authed.Screen
            name="Root"
            component={MainBottomTabNavigator}
            options={{ headerShown: false }}
          />
          <Authed.Screen
            name="NotFound"
            component={NotFoundScreen}
            options={{ title: "" }}
          />
          <Authed.Group screenOptions={{ presentation: "modal" }}>
            <Authed.Screen name="Modal" component={ModalScreen} />
          </Authed.Group>
        </Authed.Navigator>
      </PostHogWrappedProvider>
    </NavigationContainer>
  );
}

function NoAuthNavigator() {
  return (
    <NoAuth.Navigator initialRouteName="Authenticate">
      <NoAuth.Screen
        name="Authenticate"
        component={AuthenticateScreen}
        options={{ headerShown: false }}
      />
    </NoAuth.Navigator>
  );
}

function HomeTabNavigator(props: MainBottomTabScreenProps<"Home">) {
  const colorScheme = useColorScheme();

  return (
    <HomeTab.Navigator
      initialRouteName={"RoutedFeed"}
      screenOptions={{
        contentStyle: {
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.background
              : Colors.light.background,
        },
      }}
    >
      <HomeTab.Group
        screenOptions={{
          presentation: "modal",
        }}
      >
        <HomeTab.Screen
          name="SaveCoveForm"
          options={(props) => ({
            headerShown: true,

            headerTitle: "Create Cove",
            headerLeft: () => (
              <PressableRaw
                style={{ padding: 8 }}
                onPress={() => props.navigation.goBack()}
              >
                <Icon name="x" size={24} />
              </PressableRaw>
            ),
            headerBackTitleVisible: false,
          })}
          component={SaveCoveForm}
        />
      </HomeTab.Group>
      <HomeTab.Group
        screenOptions={{
          presentation: "modal",
        }}
      >
        <HomeTab.Screen
          name="NewCastModal"
          options={(props) => ({
            headerShown: true,
            headerShadowVisible: false,
            headerTitle: "",
            headerLeft: () => (
              <PressableRaw
                style={{ padding: 8 }}
                onPress={() => props.navigation.goBack()}
              >
                <Icon name="x" size={24} />
              </PressableRaw>
            ),
            headerBackTitleVisible: false,
          })}
          component={NewCastModal}
        />
      </HomeTab.Group>
      <HomeTab.Group
        screenOptions={{
          presentation: "modal",
        }}
      >
        <HomeTab.Screen
          name="FiltersModal"
          options={(props) => ({
            headerShown: false,

            headerBackTitleVisible: false,
          })}
          component={FiltersModal}
        />
      </HomeTab.Group>
      <HomeTab.Group
        screenOptions={{
          presentation: "modal",
        }}
      >
        <HomeTab.Screen
          name="FullScreenImageModal"
          options={(props) => ({
            headerShown: true,

            headerTitle: "",
            headerLeft: () => (
              <PressableRaw
                style={{ padding: 8 }}
                onPress={() => props.navigation.goBack()}
              >
                <Icon name="x" size={24} />
              </PressableRaw>
            ),
            headerRight: () => (
              <PressableRaw
                style={{ padding: 8 }}
                onPress={async () => {
                  try {
                    Haptics.selectionAsync();

                    const result = await Share.share({
                      url: `https://www.discove.xyz/casts/${props.route.params.imageUrl}`,
                    });
                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                <Icon name="upload" size={24} />
              </PressableRaw>
            ),
            headerBackTitleVisible: false,
          })}
          component={FullScreenImageModal}
        />
      </HomeTab.Group>
      <HomeTab.Screen
        name="RoutedFeed"
        options={(props) => ({
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          headerLeft: () => <RoutedFeedHeaderLeft {...props} />,
          headerTitle: "",
          headerRight: () => <Filters />,
        })}
        component={RoutedFeedScreen}
      />
      <HomeTab.Screen
        options={() => ({
          header: (props) => <FeedHeader />,
        })}
        name="NamedFeed"
        component={NamedFeedScreen}
      />
      <HomeTab.Screen
        options={() => ({
          headerTitle: "My Bookmarks",
        })}
        name="Bookmarks"
        component={BookmarksScreen}
      />
      <HomeTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={(props) => ({
          headerShadowVisible: false,
          // headerBackTitle: "Back",
          headerLeft: () => (
            <TouchableHighlight
              style={{ marginLeft: 6, padding: 8 }}
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Icon name="arrow-left" size={24} color={Colors["gray"]["600"]} />
            </TouchableHighlight>
          ),
          // headerBackTitleVisible: false,
          // headerRight: () => {
          //   const { route, navigation } = props;
          //   const username = route?.params?.username;

          //   /** Support fid param for deep linking **/
          //   const fid = route?.params?.fid
          //     ? Number(route?.params?.fid)
          //     : undefined;
          //   const profile = useFCProfileByFid(fid);

          //   React.useEffect(() => {
          //     if (!username && fid && profile) {
          //       navigation.setParams({
          //         username: profile.username ?? undefined,
          //         fid: undefined,
          //       });
          //     }
          //   }, [fid, profile]);

          //   if (!profile) return null;

          //   return (
          //     <>
          //       <MoreButton profile={profile} />
          //       <PressableRaw
          //         style={{ padding: 8 }}
          //         onPress={() => props.navigation.navigate("Settings")}
          //       >
          //         <Icon name="settings" size={24} />
          //       </PressableRaw>
          //     </>
          //   );
          // },
          headerTitle: "",
        })}
      />
      <HomeTab.Screen
        name="Thread"
        options={() => ({
          headerLeft: () => (
            <TouchableHighlight
              style={{ marginLeft: 6, padding: 8 }}
              onPress={() => {
                props.navigation.goBack();
              }}
            >
              <Icon name="arrow-left" size={24} color={Colors["gray"]["600"]} />
            </TouchableHighlight>
          ),
          title: "Thread",
        })}
        component={ThreadScreen}
      />
      <HomeTab.Screen
        name="Cast"
        options={() => ({
          headerBackTitle: "Back",
          headerBackTitleVisible: false,
          title: "Cast",
        })}
        component={CastScreen}
      />
      <HomeTab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerBackTitle: "Back",
        }}
      />
    </HomeTab.Navigator>
  );
}

function MainBottomTabNavigator(props: AuthedScreenProps<"Root">) {
  const colorScheme = useColorScheme();
  const unreadNotifications = useFCNotificationsCount();

  return (
    <MainBottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}
    >
      <MainBottomTab.Screen
        name="Home"
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            Haptics.selectionAsync();
          },
        })}
        component={HomeTabNavigator}
        options={({ navigation }) => ({
          tabBarShowLabel: false,
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        })}
      />
      <MainBottomTab.Screen
        name="AutocompleteSearch"
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            Haptics.selectionAsync();
          },
        })}
        component={AutocompleteSearchScreen}
        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <MainBottomTab.Screen
        name="Coves"
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            Haptics.selectionAsync();
          },
        })}
        component={CovesScreen}
        options={(props) => ({
          headerShown: false,
          tabBarShowLabel: false,

          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        })}
      />
      <MainBottomTab.Screen
        name="Notifications"
        listeners={({ navigation, route }) => ({
          tabPress: () => {
            Haptics.selectionAsync();
          },
        })}
        component={NotificationsScreen}
        options={{
          title: "Notifications",
          tabBarShowLabel: false,
          tabBarBadge: unreadNotifications || undefined,
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
    </MainBottomTab.Navigator>
  );
}

function TabBarIcon(props: { name: TablerIconName; color: string }) {
  return <Icon size={30} style={{ marginTop: -4 }} {...props} />;
}
