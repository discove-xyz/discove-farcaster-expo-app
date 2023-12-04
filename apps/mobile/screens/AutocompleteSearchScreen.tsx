import { useEffect, useState, FC, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
} from "react-native";
import { Icon } from "../components/Icon";
import Colors from "../constants/Colors";
import { useFetcher } from "@discove/ui/useSwr";
import { API, FCProfile } from "@discove/util/types";
import Sizes from "../constants/Sizes";
import { useDebounce } from "../hooks/useDebounce";
import { Text } from "../components/Text";
import { Sentry } from "../lib/sentry";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image } from "../components/Image";
import { View } from "../components/View";
import { TextInput } from "../components/TextInput";
import { MainBottomTabScreenProps } from "../navigation/navigation-types";

type APISearchAutoComplete = API["/api/search-autocomplete"]["GET"];

type ResultTypeProfile = Pick<
  FCProfile,
  "bio" | "fid" | "display_name" | "username" | "avatar_url"
> & { levenshtein_distance: number; result_type: "profile" };

type ResultTypeSearchCasts = {
  text: string;
  result_type: "search-casts";
  levenshtein_distance: number;
};

type ResultTypeSearchProfiles = {
  text: string;
  result_type: "search-profiles";
  levenshtein_distance: number;
};

type SearchResult =
  | ResultTypeProfile
  | ResultTypeSearchCasts
  | ResultTypeSearchProfiles
  | ResultTypeCove;

type CategorySearchResultProps = {
  children: string;
  icon: "search" | "user-search";
  onPress: () => void;
  text: string;
};

type ResultTypeCove = {
  result_type: "cove";
  feedname: string;
  username: string;
  config: {
    d?: string;
    t?: string;
  };
};

const CategorySearchResult: FC<CategorySearchResultProps> = ({
  children,
  icon,
  onPress,
  text,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: Sizes.inputPaddingHorizontal,
      marginVertical: Sizes.inputPaddingVertical,
    }}
  >
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: 48,
        height: 48,
      }}
    >
      <Icon name={icon} size={32} />
    </View>
    <View style={{ flex: 1, marginLeft: 16 }}>
      <Text style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}>
        {children}
      </Text>
      <Text style={{ color: "gray" }}>{text}</Text>
    </View>
  </TouchableOpacity>
);

const ProfileSearchResult: FC<ResultTypeProfile> = ({
  username,
  display_name,
  avatar_url,
  bio,
}) => {
  const navigation =
    useNavigation<
      MainBottomTabScreenProps<"AutocompleteSearch">["navigation"]
    >();
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: Sizes.inputPaddingHorizontal,
        marginVertical: Sizes.inputPaddingVertical,
      }}
      onPress={() => {
        navigation.navigate("Home", {
          screen: "Profile",
          params: {
            username: username ?? undefined,
          },
        });
      }}
    >
      <Image
        type="profile"
        key={avatar_url}
        source={{ uri: avatar_url ?? "" }}
        width={48}
        height={48}
        style={{
          borderRadius: 24,
          height: 48,
          width: 48,
          backgroundColor: Colors.gray["200"],
          overflow: "hidden",
        }}
        resizeMode={"cover"}
      />
      <View
        style={{
          flex: 1,
          marginLeft: 16,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}>
            {display_name}
          </Text>
          <Text
            style={{
              marginLeft: 4,
              fontFamily: "SF-Pro-Rounded-Regular",
              fontSize: 17,
            }}
          >
            @{username}
          </Text>
        </View>
        <Text numberOfLines={3} style={{ color: "gray" }}>
          {bio}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const CoveSearchResult: FC<ResultTypeCove> = ({
  feedname,
  username,
  config,
}) => {
  const navigation =
    useNavigation<
      MainBottomTabScreenProps<"AutocompleteSearch">["navigation"]
    >();

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: Sizes.inputPaddingHorizontal,
        marginVertical: Sizes.inputPaddingVertical,
      }}
      onPress={() => {
        // navigation.navigate("Root", {
        //   screen: "Home",
        //   params: {
        //     screen: "RoutedFeed",
        //     params: {
        //       username: username,
        //       feedname: feedname,
        //     },
        //   },
        // });
        navigation.navigate("Home", {
          screen: "NamedFeed",
          params: {
            username: username,
            feedname: feedname,
          },
        });
      }}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: 48,
          height: 48,
        }}
      >
        <Icon name="list" size={32} />
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 16,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Text
            numberOfLines={2}
            style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}
          >
            {config.t}
            <Text
              numberOfLines={1}
              style={{ fontFamily: "SF-Pro-Rounded-Regular", fontSize: 17 }}
            >
              {" "}
              @{username}/{feedname}
            </Text>
          </Text>
        </View>
        <Text
          numberOfLines={3}
          style={{
            color: "gray",
            display: config.d === "" ? "none" : "flex",
          }}
        >
          {config.d}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const idFromSearchResult = (searchResult: SearchResult): string => {
  switch (searchResult.result_type) {
    case "search-casts":
      return `search-cast-${searchResult.text}`;
    case "search-profiles":
      return `search-profiles-${searchResult.text}`;
    case "profile":
      return String(searchResult.fid);
    case "cove":
      return searchResult.feedname;
  }
};

const renderResult = ({
  result,
  navigation,
}: {
  result: SearchResult;
  navigation: NavigationProp<any>;
}) => {
  switch (result.result_type) {
    case "search-casts":
      return (
        <CategorySearchResult
          icon="search"
          onPress={() => {
            navigation.navigate("RoutedFeed", {
              q: result.text,
              type: "cast",
            });
          }}
          text={`Search casts`}
          key={idFromSearchResult(result)}
        >
          {result.text}
        </CategorySearchResult>
      );
    case "search-profiles":
      return (
        <CategorySearchResult
          icon="user-search"
          onPress={() => {
            navigation.navigate("RoutedFeed", {
              q: result.text,
              type: "profile",
            });
          }}
          text={`Search profile names and bios`}
          key={idFromSearchResult(result)}
        >
          {result.text}
        </CategorySearchResult>
      );
    case "profile":
      return (
        <ProfileSearchResult {...result} key={idFromSearchResult(result)} />
      );
    case "cove":
      return <CoveSearchResult {...result} key={idFromSearchResult(result)} />;
  }
};

export default function AutocompleteSearchScreen(
  props: MainBottomTabScreenProps<"AutocompleteSearch">
) {
  const { navigation } = props;

  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const [text, onChangeText] = useState<string | undefined>(undefined);
  const [queryError, setQueryError] = useState<Error | undefined>(undefined);
  const [queryResults, setQueryResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(text, 300);
  const fetcher = useFetcher();

  useEffect(() => {
    if (debouncedQuery === undefined) {
      return undefined;
    }

    const params = new URLSearchParams({
      q: debouncedQuery,
    });

    if (debouncedQuery !== "") {
      (async () => {
        try {
          const path = `/api/search-autocomplete?${params}`;
          const response = await fetcher<APISearchAutoComplete>(path);

          // search-profiles and search-casts come back as results even if the query is empty.
          const results = response.results.filter(
            (result) =>
              !(result.result_type === "search-casts" && result.text === "") &&
              !(result.result_type === "search-profiles" && result.text === "")
          );

          setQueryResults(results);
        } catch (err) {
          console.error(err);
          Sentry.captureException(err);
          setQueryResults([]);
          if (err instanceof Error) {
            setQueryError(err);
          }
        }
      })();
    } else {
      setQueryResults([]);
    }
  }, [fetcher, debouncedQuery]);

  const handleSearchPress = useCallback(() => {
    if (inputRef.current === null) {
      return undefined;
    }

    inputRef.current.focus();
  }, [inputRef]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        _dark={{
          borderColor: inputFocused ? Colors.gray["100"] : Colors.gray["600"],
        }}
        _light={{
          borderColor: inputFocused ? Colors.gray["400"] : Colors.gray["200"],
        }}
        style={{
          alignItems: "center",
          backgroundColor: Colors.blackAlpha["50"],
          borderWidth: 1,
          borderRadius: Sizes.borderRadiusMd,
          flexDirection: "row",
          marginHorizontal: 16,
          marginTop: 16,
          padding: 0,
        }}
      >
        <TouchableOpacity onPress={handleSearchPress}>
          <Icon
            name="search"
            style={{ paddingLeft: Sizes.inputPaddingHorizontal }}
            size={24}
            lightColor={Colors.black}
            darkColor={Colors.white}
          />
        </TouchableOpacity>
        <TextInput
          autoFocus
          onBlur={() => {
            setInputFocused(false);
          }}
          onChangeText={onChangeText}
          onFocus={() => {
            setInputFocused(true);
          }}
          placeholder="Search Casts, Profiles or Coves"
          ref={inputRef}
          style={{
            flexGrow: 1,
            fontFamily: "SF-Pro-Rounded-Semibold",
            backgroundColor: "transparent",
            borderWidth: 0,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 20,
            paddingVertical: 12,
          }}
          value={text}
        />
        {text ? (
          <TouchableOpacity onPress={() => onChangeText("")}>
            <Icon
              name="x"
              style={{ paddingRight: Sizes.inputPaddingHorizontal }}
              size={24}
              lightColor={Colors.black}
              darkColor={Colors.white}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        {queryError !== undefined ? (
          <View
            style={{
              marginTop: 16,
            }}
          >
            <Text
              darkColor={Colors.gray["200"]}
              lightColor={Colors.gray["700"]}
              style={{
                textAlign: "center",
                fontFamily: "SF-Pro-Rounded-Regular",
                fontSize: 17,
              }}
            >
              search failed
            </Text>
          </View>
        ) : queryResults.length === 0 ? null : (
          queryResults.map((result) => renderResult({ result, navigation }))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
