import Tweet from "./Tweet"
import { useTweets } from "./AppProvider"

export default function TweetList(props) {
  const { tweets } = useTweets()

  /**
   * Filter all tweets using the selected address
   */
  const getFilteredTweets = () => {
    // console.log("Before", tweets)
    let filtered = [...tweets.entries()].filter(
      (tweet) => tweet[1].replyID.eq(0) && !tweet[1].deleted
    )
    // console.log("Filtered", filtered)
    if (props.filter) {
      filtered = filtered.filter((tweet) => tweet[1].from == props.filter)
    }
    // console.log("Filtered", filtered)
    return filtered
  }

  /**
   * Filter for all replies to a tweet
   * @param {number} id
   */
  const getReplies = (id) => {
    let replies = [...tweets.entries()].filter(
      (tweet) => tweet[1].replyID.eq(id) && !tweet[1].deleted
    )
    return replies
  }

  return (
    <section>
      {Array.from(getFilteredTweets(), ([id]) => {
        const replies = getReplies(id)
        return (
          <div className="border-b">
            <Tweet id={id} key={id} replies={replies} />
          </div>
        )
      }).reverse()}
    </section>
  )
}
