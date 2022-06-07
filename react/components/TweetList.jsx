import Tweet from "./Tweet"
import { useTweets } from "./AppProvider"
import { BigNumber } from "ethers"

export default function TweetList(props) {
  const { tweets } = useTweets()

  /**
   * Filter all tweets using the selected address
   */
  const getFilteredTweets = () => {
    let filtered = [...tweets.entries()].filter(
      (tweet) => tweet[1].replyID == BigNumber.from(0)
    )
    if (props.filter) {
      filtered = filtered.filter((tweet) => tweet[1].from == props.filter)
    }
    return filtered
  }

  return (
    <section>
      {Array.from(getFilteredTweets(), ([id, tweet]) => {
        return <Tweet id={id} key={id} tweet={tweet} />
      }).reverse()}
    </section>
  )
}
