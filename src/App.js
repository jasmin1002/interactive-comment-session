import React from "react";
import { Fragment, useState, useRef } from "react";

import data from "./data.json";

const { currentUser: user, comments: posts } = data;

export default function App() {
  const [comments, setComments] = useState(posts);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [recipientName, setRecipientName] = useState("");

  function addComment(comment) {
    const updateComments = [...comments, comment];
    setComments(updateComments);
  }

  function addReply(reply, id) {
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
    // parentID = comments.find((comment) =>
    //   comment.replies.find((reply) => reply.id === id)
    // )?.id;

    // if (parentID)
    //   setComments(
    //     comments.map((comment) =>
    //       comment.id === parentID
    //         ? { ...comment, replies: [...comment.replies, reply] }
    //         : comment
    //     )
    //   );
    setSelectedRecipient(null);
  }

  function handleSelectRecipient(id, posts) {
    const username = posts.find((post) => post.id === id).user.username;
    // setSelectedRecipient((selected) => (id === selected ? null : id));
    setSelectedRecipient(id);
    setRecipientName(username);
  }

  // function createComment(parentID, reply) {
  //   const modifiedReply = { ...reply, user };

  //   setComments((posts) => {
  //     const replies = [
  //       ...posts?.find((post) => post.id === parentID)?.replies,
  //       modifiedReply,
  //     ];

  //     return posts.map((post) =>
  //       post.id === parentID ? { ...post, replies } : post
  //     );
  //   });
  // }

  return (
    <main className="app">
      <CommentList
        comments={comments}
        selectedRecipient={selectedRecipient}
        replyingTo={recipientName}
        onSelectRecipient={handleSelectRecipient}
        // onCreateComment={createComment}
        addReply={addReply}
      />
      <PostComment type="post-comment">
        <Avatar user={user} className="user-avatar" />
        <CommentForm
          addComment={addComment}
          parentID={null}
          comments={comments}
        />
      </PostComment>
    </main>
  );
}

function CommentList({
  comments,
  className,
  selectedRecipient,
  replyingTo,
  onSelectRecipient,
  // onCreateComment,
  addReply,
}) {
  const [editMode, setEditMode] = useState(false);
  function handleEdit() {
    setEditMode(true);
  }

  return (
    <ul className={`comment-list ${className ? className : ""}`}>
      {comments.map((comment) => (
        <React.Fragment key={comment.id}>
          <Comment {...comment} comments={comments} editMode={editMode}>
            {comment.user.username !== "juliusomo" ? (
              <ReplyButton
                id={comment.id}
                list={comments}
                onSelectRecipient={onSelectRecipient}
              />
            ) : (
              <>
                <DeleteButton />
                <EditButton onEdit={handleEdit} />
              </>
            )}
          </Comment>
          {comment.id === selectedRecipient && (
            <PostComment type="post-reply">
              <Avatar user={user} className="user-avatar" />
              <CommentForm
                type={"post-reply"}
                parentID={comment.id}
                replyingTo={replyingTo}
                // onCreateComment={onCreateComment}
                addComment={addReply}
                comments={comments}
              />
            </PostComment>
          )}
          {comment.replies?.length > 0 ? (
            <CommentList
              comments={comment.replies}
              className="reply"
              selectedRecipient={selectedRecipient}
              replyingTo={replyingTo}
              onSelectRecipient={onSelectRecipient}
              // onCreateComment={onCreateComment}
              addReply={addReply}
            />
          ) : (
            ""
          )}
        </React.Fragment>
      ))}
    </ul>
  );
}

function Comment({
  id,
  score,
  content,
  createdAt,
  user,
  replies,
  replyingTo,
  comments,
  editMode,
  children,
  onCreateComment,
}) {
  return (
    <li className="comment">
      <CommentVoteScore score={score} />
      <section className="comment-detail">
        <CommentTop>
          <Profile user={user} />
          <Timestamp createdAt={createdAt} />
          {children}
        </CommentTop>
        {editMode && user.username === "juliusomo" ? (
          <EditComment replyingTo={replyingTo} content={content} />
        ) : (
          <CommentMessage>
            <p>
              <span className="replying-to">
                {replyingTo ? `@${replyingTo} ` : ""}
              </span>
              {content}
            </p>
          </CommentMessage>
        )}
      </section>
    </li>
  );
}

function CommentVoteScore({ score }) {
  return (
    <div className="votes">
      <button className="btn btn-incr">
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
      <button className="btn btn-desc">
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

function Timestamp({ createdAt }) {
  return <p className="timestamp">{createdAt}</p>;
}

function CommentTop({ children }) {
  return <header className="comment-top">{children}</header>;
}

function CommentMessage({ children }) {
  return <article className="comment-description">{children}</article>;
}

function Profile({ user }) {
  return (
    <figure className="user-profile">
      <img
        src={user?.image?.png}
        alt={`${user?.username}`}
        className="avatar"
      />
      <figcaption className="user-name">{user?.username}</figcaption>
      {user.username === "juliusomo" && (
        <span className="current-user">you</span>
      )}
    </figure>
  );
}

function Avatar({ user, className }) {
  return (
    <img
      src={user.image.png}
      alt={`${user.username}'s pic`}
      className={className}
    />
  );
}

function PostComment({ type, children }) {
  return <section className={type}>{children}</section>;
}

function CommentForm({
  type,
  replyingTo,
  parentID,
  comments,
  addComment,
  onCreateComment,
}) {
  const [content, setContent] = useState("");

  function handleChange(evt) {
    const res = evt.target.value.includes(`@${replyingTo}`)
      ? evt.target.value.split(" ").slice(1).join(" ")
      : evt.target.value;
    setContent(res);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
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

    addComment(comment, parentID);
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

function ReplyButton({ id, list, onSelectRecipient }) {
  // console.log(list);
  return (
    <button
      className="btn btn-reply"
      onClick={() => onSelectRecipient(id, list)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="icon reply-icon">
        <path d="M.227 4.316 5.04.16a.657.657 0 0 1 1.085.497v2.189c4.392.05 7.875.93 7.875 5.093 0 1.68-1.082 3.344-2.279 4.214-.373.272-.905-.07-.767-.51 1.24-3.964-.588-5.017-4.829-5.078v2.404c0 .566-.664.86-1.085.496L.227 5.31a.657.657 0 0 1 0-.993Z" />
      </svg>
      Reply
    </button>
  );
}

function EditButton({ onEdit }) {
  return (
    <button className="btn btn-edit" onClick={onEdit}>
      <svg xmlns="http://www.w3.org/2000/svg" className="icon edit-icon">
        <path d="M13.479 2.872 11.08.474a1.75 1.75 0 0 0-2.327-.06L.879 8.287a1.75 1.75 0 0 0-.5 1.06l-.375 3.648a.875.875 0 0 0 .875.954h.078l3.65-.333c.399-.04.773-.216 1.058-.499l7.875-7.875a1.68 1.68 0 0 0-.061-2.371Zm-2.975 2.923L8.159 3.449 9.865 1.7l2.389 2.39-1.75 1.706Z" />
      </svg>
      Edit
    </button>
  );
}

function DeleteButton({ id, list, onSelectRecipient }) {
  // console.log(list);
  return (
    <button
      className="btn btn-delete"
      onClick={() => onSelectRecipient(id, list)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="icon delete-icon">
        <path d="M1.167 12.448c0 .854.7 1.552 1.555 1.552h6.222c.856 0 1.556-.698 1.556-1.552V3.5H1.167v8.948Zm10.5-11.281H8.75L7.773 0h-3.88l-.976 1.167H0v1.166h11.667V1.167Z" />
      </svg>
      Delete
    </button>
  );
}

function EditComment({ replyingTo, content }) {
  const [addonContent, setAddonContent] = useState(`@${replyingTo} ${content}`);

  function handleChange(evt) {
    setAddonContent(evt.target.value);
  }

  function handleSubmit(evt) {
    evt.preventDefault();
    console.log(addonContent.split(" ").splice(1).join(" "));
  }

  return (
    <form className="edit-comment" onSubmit={handleSubmit}>
      <textarea
        className="comment-input"
        value={addonContent}
        onChange={handleChange}
        placeholder="Add a comment..."
      />
      <button type="submit" className="btn btn-submit">
        Update
      </button>
    </form>
  );
}
