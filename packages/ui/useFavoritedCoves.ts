import { useContext } from "react";
import { FavoriteContext } from "./FavoriteContext";

export function useFavoritedCoves(): FavoriteContext {
  const favoritedCovesContext = useContext(FavoriteContext);

  return favoritedCovesContext;
}

// Prefer FavoriteContext for global uniqueness
// export const useFavoritedCoves = (): [CoveFavorite[], Function] => {
//   const user = useUser()
//   const [favoritedCoves, setFavoritedCoves] = useState([])

//   const { supabaseClient } = useSessionContext()
//   async function fetchFavoritedCoves() {
//     const { data, error } = await supabaseClient
//       .from('cove_favorites')
//       .select()
//       .eq('user_id', user.id)

//     if (error) {
//       Sentry.captureException(error)
//     }

//     setFavoritedCoves(data)
//   }
//   useEffect(() => {
//     if (user) fetchFavoritedCoves()
//   }, [supabaseClient, user])

//   return [favoritedCoves, fetchFavoritedCoves]
// }
