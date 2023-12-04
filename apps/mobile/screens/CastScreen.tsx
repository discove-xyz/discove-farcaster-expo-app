import React from "react";
import { useSWR } from "@discove/ui/useSwr";
import { CastItem } from "../components/CastItem";
import { ScrollView } from "react-native";
import { HomeTabScreenProps } from "../navigation/navigation-types";
import { FCCast } from "@discove/util/types";

export default function CastScreen(props: HomeTabScreenProps<"Cast">) {
  const hash = props.route?.params?.castHash;
  const { data } = useSWR<{ cast: FCCast }>(
    hash ? `/api/casts/${hash}` : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  if (!data?.cast) return null;

  return (
    <ScrollView>
      <CastItem cast={data?.cast} fullPageMode noBorderBottom verticalLines />
    </ScrollView>
  );
}
