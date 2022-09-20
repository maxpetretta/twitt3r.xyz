import toast from "react-hot-toast"
import {
  useContractRead,
  useContractWrite,
  UserRejectedRequestError,
} from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"
import { EditProps } from "../lib/types.js"
import Avatar from "./Avatar"

export default function EditTweet(props: EditProps) {
  /**
   * Contract hooks
   */
  const { refetch: totalTweetsRefetch } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "getTotalTweets"
  )

  const { write: editTweet } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "editTweet",
    {
      onSuccess(data) {
        totalTweetsRefetch().then((value) => {
          toast.success("Edited tweet!")
          console.debug("Edited --", data.hash)
          console.debug(
            "Retrieved total tweet count --",
            value.data!.toNumber()
          )
        })
      },
      onError(error) {
        if (error instanceof UserRejectedRequestError) {
          toast.error("User rejected transaction")
          console.error("User rejected transaction")
        } else if (error.message.includes("Unauthorized()")) {
          toast.error("You are not the author!")
          console.error("Unauthorized --", error)
        } else {
          toast.error("Transaction failed")
          console.error("Transaction failed --", error)
        }
      },
    }
  )

  /**
   * Update the specified tweet from the contract
   * @param {number} id
   */
  const sendEdit = async (id: number) => {
    try {
      editTweet({
        args: [id, props.message],
      })
      props.setModal(false)
    } catch (error) {
      toast.error("Transaction failed")
      console.error("Transaction failed --", error)
    }
  }

  return (
    <>
      {props.modal && (
        <div
          className="fixed inset-0 z-10 bg-gray-500 bg-opacity-50"
          id="replyModal-overlay"
        />
      )}
      {props.modal && (
        <div
          className="absolute inset-x-0 top-0 z-20 m-auto h-full w-full flex-col rounded-none bg-white md:top-12 md:h-fit md:w-128 md:rounded-xl"
          id="edit-modal"
        >
          <button
            className="float-right m-2 h-fit w-fit rounded-full p-2 transition duration-200 hover:bg-gray-200"
            onClick={() => props.setModal(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="mt-16 mb-4 flex items-center md:mt-4">
            <Avatar address={props.address} />
            <textarea
              rows={1}
              value={props.message}
              maxLength={280}
              placeholder="Edit your tw33t's message"
              onChange={(e) => props.setMessage(e.target.value)}
              onInput={(e) => {
                ;(e.target as HTMLInputElement).style.height = "auto"
                ;(e.target as HTMLInputElement).style.height =
                  (e.target as HTMLInputElement).scrollHeight + "px"
              }}
              className="mr-4 mb-4 grow resize-none text-xl outline-none"
            />
          </div>
          <div className="mt-auto flex items-center justify-between border-t">
            <span className="m-3 text-sm text-gray-500">Price: Just gas</span>
            <div>
              <span className="text-gray-500">
                {props.message ? props.message.length + "/280" : ""}
              </span>
              <button
                className="button m-3 self-end"
                onClick={() => sendEdit(props.id)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
