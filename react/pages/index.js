import Layout from "../components/Layout"
import Editor from "../components/Editor"
import TweetList from "../components/TweetList"

export default function Index() {
  return (
    <>
      <Layout>
        <Editor />
        <TweetList />
      </Layout>
    </>
  )
}
