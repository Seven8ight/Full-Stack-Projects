"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import BackgroundImage from "./../../public/circle-scatter-haikei.svg";
import styles from "./page.module.scss";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { forwardRef, Ref, useEffect, useRef, useState } from "react";

const Modal = forwardRef<
  HTMLDivElement,
  {
    username: string;
    email: string;
    className: string;
  }
>(({ username, email, className }, ref) => {
  return (
    <div ref={ref} id="edit-container" className={className}>
      <div id=""></div>
      <div id="background" className={styles.modalBackground} />

      <div id="image" className={styles.modalInfo}>
        <Image
          className={styles.modalImage}
          src={BackgroundImage}
          alt="profile image"
        />
        <div id="current-info">
          <h3>John Doe</h3>
          <h4>jdoe@gmail.com</h4>
        </div>
      </div>
      <div id="info" className={styles.modalInput}>
        <div>
          <Label>Username</Label>
          <Input type="text" placeholder={username} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="text" placeholder={email} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="text" placeholder={"New password here"} />
        </div>
        <div>
          <Label>Profile Photo</Label>
          <Input type="file" />
        </div>
      </div>
      <div id="buttons" className={styles.modalButtons}>
        <Button>Save Changes</Button>
        <Button>Delete profile</Button>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

const Profile = (): React.ReactNode => {
  const [modal, setModal] = useState<boolean>(false),
    modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modal]);

  return (
    <div id="container">
      <div id="background" className={styles.background}>
        <Image
          loading="eager"
          id="cover"
          src={BackgroundImage}
          alt="Background cover"
        />
      </div>
      <div id="profile-card" className={styles.card}>
        <div id="image">
          <Image
            id="profile-page"
            className={styles.profileImg}
            src={BackgroundImage}
            alt="profile page"
          />
        </div>
        <div id="details" className={styles.details}>
          <div id="name" className={styles.name}>
            <h2>Samantha Jones</h2>
            <p>sjones@gmail.com</p>
          </div>
          <div id="desc">
            <p>
              All users here are appreciated and supported all
              <br /> the way.
            </p>
            <div id="todos" className={styles.todos}>
              <div id="summary">
                <h3>65</h3>
                <p>Completed</p>
              </div>
              <div id="summary">
                <h3>35</h3>
                <p>In progress</p>
              </div>
              <div id="summary">
                <h3>12</h3>
                <p>Current</p>
              </div>
            </div>
          </div>
          <div id="editprofilebtn" className={styles.editProfile}>
            <Button onClick={() => setModal(!modal)}>Edit profile</Button>
          </div>
        </div>
      </div>
      {modal && (
        <Modal
          ref={modalRef}
          username="John Doe"
          email=""
          className={styles.modal}
        />
      )}
    </div>
  );
};

export default Profile;
