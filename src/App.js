import React from "react";
import { Fragment, useState, useEffect, useRef } from "react";

// import data from "./data.json";

// const { currentUser: user, comments: posts } = data;
// let user;

export default function App() {
  const [comments, setComments] = useState(
    () => JSON.parse(localStorage.getItem("comments")) || []
  );
  const [currentUser, setCurrentUser] = useState(
    () => JSON.parse(localStorage.getItem("currentUser")) || ""
  );
  const [selectedID, setSelectedID] = useState(null);
  const [editID, setEditID] = useState(null);
  const [recipientName, setRecipientName] = useState("");

  function createComment(comment) {
    setComments((comments) => [...comments, comment]);
  }

  function createReply(reply, id) {
    let parentID = comments.find((comment) =>
      comment.replies.find((reply) => reply.id === id)
    );

    parentID = parentID ? parentID?.id : id;

    setComments(
      comments.map((comment) =>
        comment.id === parentID
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    );
    setSelectedID(null);
  }

  function editComment(id, content) {
    setComments(
      comments.map((comment) =>
        comment.id === id
          ? { ...comment, content }
          : {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === id ? { ...reply, content } : reply
              ),
            }
      )
    );
    setEditID(null);
  }

  function handleSelectID(id, posts) {
    const username = posts.find((post) => post.id === id).user.username;
    // setSelectedRecipient((selected) => (id === selected ? null : id));
    setSelectedID(id);
    setRecipientName(username);
  }

  function handleEdit(id) {
    setEditID(id);
  }

  function updateCommentVotes(evt, id) {
    const step = evt.target.classList.contains("btn-desc") ? -1 : 1;

    setComments((comments) =>
      comments.map((comment) =>
        comment.id === id
          ? { ...comment, score: comment.score + step }
          : {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === id
                  ? { ...reply, score: reply.score + step }
                  : reply
              ),
            }
      )
    );
  }

  useEffect(function () {
    async function fetchData() {
      const response = await fetch("/data/data.json");
      const data = await response.json();

      setCurrentUser(data.currentUser);
      setComments(data.comments);
    }

    const storedData = JSON.parse(localStorage.getItem("comments"));
    if (!storedData) fetchData();
  }, []);

  useEffect(
    function () {
      localStorage.setItem("comments", JSON.stringify(comments));
    },
    [comments]
  );

  useEffect(
    function () {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    },
    [currentUser]
  );

  useEffect(
    function () {
      /**Infinite renders */
      // setComments((comments) => [
      //   ...comments.sort((a, b) => b.score - a.score),
      // ]);
      setComments((comments) => comments.sort((a, b) => b.score - a.score));
    },
    [comments]
  );

  return (
    <main className="app">
      {comments.length === 0 ? (
        <Loader />
      ) : (
        <>
          <CommentList
            comments={comments}
            currentUser={currentUser}
            selectedID={selectedID}
            editID={editID}
            replyingTo={recipientName}
            onSelectID={handleSelectID}
            onEdit={handleEdit}
            editComment={editComment}
            createReply={createReply}
            updateVotes={updateCommentVotes}
          />
          <PostComment type="post-comment">
            <Avatar user={currentUser} className="user-avatar" />
            <CommentForm
              createComment={createComment}
              parentID={null}
              comments={comments}
            />
          </PostComment>
        </>
      )}
    </main>
  );
}

function Loader() {
  return <p>Loading...</p>;
}

function CommentList({
  comments,
  currentUser,
  className,
  selectedID,
  editID,
  replyingTo,
  onSelectID,
  onEdit,
  createReply,
  editComment,
  updateVotes,
}) {
  return (
    <ul className={`comment-list ${className ? className : ""}`}>
      {comments.map((comment) => (
        <React.Fragment key={comment.id}>
          <Comment comments={comments}>
            <CommentVoteScore
              score={comment.score}
              id={comment.id}
              updateVotes={updateVotes}
            />
            <CommentDetail>
              <CommentTop>
                <Profile user={comment.user} currentUser={currentUser} />
                <Timestamp createdAt={comment.createdAt} />
                {comment.user.username !== currentUser.username ? (
                  <ReplyButton
                    id={comment.id}
                    list={comments}
                    onSelectID={onSelectID}
                  />
                ) : (
                  <>
                    <DeleteButton />
                    <EditButton id={comment.id} onEdit={onEdit} />
                  </>
                )}
              </CommentTop>
              {comment.id === editID &&
              comment.user.username === currentUser.username ? (
                <EditComment
                  id={editID}
                  type={className}
                  replyingTo={comment.replyingTo}
                  content={comment.content}
                  editComment={editComment}
                />
              ) : (
                <CommentMessage>
                  <p>
                    <span className="replying-to">
                      {comment.replyingTo ? `@${comment.replyingTo} ` : ""}
                    </span>
                    {comment.content}
                  </p>
                </CommentMessage>
              )}
            </CommentDetail>
          </Comment>
          {comment.id === selectedID && (
            <PostComment type="post-reply">
              <Avatar user={currentUser} className="user-avatar" />
              <CommentForm
                type={"post-reply"}
                parentID={comment.id}
                replyingTo={replyingTo}
                createComment={createReply}
                comments={comments}
              />
            </PostComment>
          )}
          {comment.replies?.length > 0 ? (
            <CommentList
              comments={comment.replies}
              currentUser={currentUser}
              className="reply"
              selectedID={selectedID}
              editID={editID}
              replyingTo={replyingTo}
              onSelectID={onSelectID}
              onEdit={onEdit}
              createReply={createReply}
              editComment={editComment}
              updateVotes={updateVotes}
            />
          ) : (
            ""
          )}
        </React.Fragment>
      ))}
    </ul>
  );
}

function Comment({ children }) {
  return <li className="comment">{children}</li>;
}

function CommentVoteScore({ score, id, updateVotes }) {
  return (
    <div className="votes">
      <button className="btn btn-incr" onClick={(evt) => updateVotes(evt, id)}>
        <svg
          width="11"
          height="11"
          xmlns="http://www.w3.org/2000/svg"
          className="icon-vote"
        >
          <path d="M6.33 10.896c.137 0 .255-.05.354-.149.1-.1.149-.217.149-.354V7.004h3.315c.136 0 .254-.05.354-.149.099-.1.148-.217.148-.354V5.272a.483.483 0 0 0-.148-.354.483.483 0 0 0-.354-.149H6.833V1.4a.483.483 0 0 0-.149-.354.483.483 0 0 0-.354-.149H4.915a.483.483 0 0 0-.354.149c-.1.1-.149.217-.149.354v3.37H1.08a.483.483 0 0 0-.354.15c-.1.099-.149.217-.149.353v1.23c0 .136.05.254.149.353.1.1.217.149.354.149h3.333v3.39c0 .136.05.254.15.353.098.1.216.149.353.149H6.33Z" />
        </svg>
      </button>
      <p className="votes-score">{score}</p>
      <button className="btn btn-desc" onClick={(evt) => updateVotes(evt, id)}>
        <svg
          width="11"
          height="3"
          xmlns="http://www.w3.org/2000/svg"
          className="icon-vote"
        >
          <path d="M9.256 2.66c.204 0 .38-.056.53-.167.148-.11.222-.243.222-.396V.722c0-.152-.074-.284-.223-.395a.859.859 0 0 0-.53-.167H.76a.859.859 0 0 0-.53.167C.083.437.009.57.009.722v1.375c0 .153.074.285.223.396a.859.859 0 0 0 .53.167h8.495Z" />
        </svg>
      </button>
    </div>
  );
}

function CommentDetail({ children }) {
  return <section className="comment-detail">{children}</section>;
}

function Timestamp({ createdAt }) {
  return <p className="timestamp">{createdAt}</p>;
}

function CommentTop({ children }) {
  return <header className="comment-top">{children}</header>;
}

function CommentMessage({ children }) {
  return <article className="comment-description">{children}</article>;
}

function Profile({ user, currentUser }) {
  return (
    <figure className="user-profile">
      <img
        src={user?.image?.png}
        alt={`${user?.username}`}
        className="avatar"
      />
      <figcaption className="user-name">{user?.username}</figcaption>
      {user.username === currentUser.username && (
        <span className="current-user">you</span>
      )}
    </figure>
  );
}

function Avatar({ user, className }) {
  return (
    <img
      src={user?.image?.png}
      alt={`${user?.username}'s pic`}
      className={className}
    />
  );
}

function PostComment({ type, children }) {
  return <section className={type}>{children}</section>;
}

function CommentForm({ type, replyingTo, parentID, createComment }) {
  const [content, setContent] = useState("");

  function handleChange(evt) {
    const comment = evt.target.value.includes(`@${replyingTo}`)
      ? evt.target.value.split(" ").slice(1).join(" ")
      : evt.target.value;
    setContent(comment);
  }

  function handleSubmit(evt) {
    evt.preventDefault();

    if (content === "" || content === " ") return;

    const id = Date.now();
    const comment = {
      id,
      score: 0,
      replyingTo,
      content,
      createdAt: "1 day ago",
      user: {
        image: {
          png: "./images/avatars/image-juliusomo.png",
          webp: "./images/avatars/image-juliusomo.webp",
        },
        username: "juliusomo",
      },
      replies: [],
    };

    createComment(comment, parentID);
    setContent("");
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <textarea
        className="comment-input"
        value={type === "post-reply" ? `@${replyingTo} ${content}` : content}
        onChange={handleChange}
        placeholder="Add a comment..."
      />
      <button type="submit" className="btn btn-submit">
        {type === "post-reply" ? "Reply" : "Send"}
      </button>
    </form>
  );
}

function ReplyButton({ id, list, onSelectID }) {
  return (
    <button className="btn btn-reply" onClick={() => onSelectID(id, list)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="icon reply-icon">
        <path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z" />
      </svg>
      Reply
    </button>
  );
}

function EditButton({ id, onEdit }) {
  return (
    <button className="btn btn-edit" onClick={() => onEdit(id)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="icon edit-icon">
        <path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z" />
      </svg>
      Edit
    </button>
  );
}

function DeleteButton({ id, list, onSelectID }) {
  return (
    <button className="btn btn-delete" onClick={() => onSelectID(id, list)}>
      <svg xmlns="http://www.w3.org/2000/svg" className="icon delete-icon">
        <path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z" />
      </svg>
      Delete
    </button>
  );
}

function EditComment({ id, type, replyingTo, content, editComment }) {
  const [newContent, updateContent] = useState(
    type === "reply" ? `@${replyingTo} ${content}` : content
  );
  const inputText = useRef("");

  function handleChange(evt) {
    updateContent(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();

    editComment(
      id,
      newContent.includes(replyingTo)
        ? newContent.split(" ").splice(1).join(" ")
        : newContent
    );
  }

  useEffect(function () {
    const end = inputText.current.value.length;
    inputText.current.setSelectionRange(end, end);
    inputText.current.focus();
  }, []);

  return (
    <form className="edit-comment" onSubmit={handleSubmit}>
      <textarea
        className="comment-input"
        value={newContent}
        onChange={handleChange}
        placeholder="Add a comment..."
        ref={inputText}
      />
      <button type="submit" className="btn btn-update">
        Update
      </button>
    </form>
  );
}
