import Tweet from "./Tweet"
import { useTweets } from "./AppProvider"

export default function TweetList(props) {
  const { tweets, setTweets } = useTweets()

  /**
   * Filter all tweets using the selected address
   */
  const getFilteredTweets = () => {
    if (props.filter) {
      const filtered = [...tweets.entries()].filter((tweet) => tweet[1].from == props.filter)
      return filtered
    } else {
      return tweets
    }
  }

  return (
    <section>
      {Array.from(getFilteredTweets(), ([id, tweet]) => {
        return (
          <Tweet
            id={id}
            key={id}
            tweet={tweet}
          />
        )
      }).reverse()}
    </section>
  )
}
