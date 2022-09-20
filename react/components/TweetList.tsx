import { Tweet as TweetType } from "../lib/types"
import { useTweets } from "./AppProvider"
import Tweet from "./Tweet"

export default function TweetList(props: { author?: string }) {
  const { tweets } = useTweets()

  /**
   * Filter for all tweets from the specified address
   * @returns {Array}
   */
  const getAuthorTweets = (): TweetType[] => {
    if (tweets) {
      let filtered = [...tweets.values()].filter(
        (tweet) => tweet.replyID.eq(0) && !tweet.deleted
      )
      if (props.author) {
        filtered = filtered.filter((tweet) => tweet.from == props.author)
      }
      return filtered
    }
    return []
  }

  /**
   * Filter for all replies to a tweet
   * @param {number} id
   * @returns {Array}
   */
  const getReplies = (id: number): [number, TweetType][] => {
    if (tweets) {
      let replies = [...tweets.entries()].filter(
        (tweet) => tweet[1].replyID.eq(id) && !tweet[1].deleted
      )
      return replies
    }
    return []
  }

  return (
    <section>
      {tweets &&
        getAuthorTweets()
          .map((tweet) => {
            const replies = getReplies(tweet.id)
            return (
              <div key={tweet.id} className="border-b">
                <Tweet id={tweet.id} key={tweet.id} replies={replies} />
              </div>
            )
          })
          .reverse()}
    </section>
  )
}
