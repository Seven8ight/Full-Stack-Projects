"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import BackgroundImage from "./../../public/circle-scatter-haikei.svg";
import styles from "./page.module.scss";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangeEvent, forwardRef, useEffect, useRef, useState } from "react";
import useProfile from "../_components/Profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type details = {
  username: string;
  email: string;
  password: string;
  profileImage: string;
};

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent) => {
      resolve(reader.result as string);
    };

    reader.onerror = () => reject("File conversion failed");

    reader.readAsDataURL(file);
  });
};

const Modal = forwardRef<
  HTMLDivElement,
  {
    username: string;
    email: string;
    className: string;
    profileImage: string;
  }
>(({ username, email, profileImage, className }, ref): React.ReactNode => {
  const accessToken = localStorage.getItem("accessToken"),
    router = useRouter();

  if (!accessToken) {
    toast.error("User must be signed in first");
    return;
  }

  const [newDetails, setDetails] = useState<details>({
    username: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const inputHandler = async (
      event: ChangeEvent<HTMLInputElement>,
      type: keyof details,
    ) => {
      if (type == "profileImage") {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
          alert("Only images allowed");
          return;
        }

        if (file.size > 500 * 1024) {
          toast.error("Image is too large (max 500KB)");
          return;
        }

        const base64 = await fileToBase64(file);

        setDetails((details) => ({
          ...details,
          profileImage: base64,
        }));
      } else
        setDetails((details) => ({
          ...details,
          [type]: event.target.value,
        }));
    },
    submitHandler = async () => {
      const newValues = Array.from(Object.entries(newDetails)).filter(
          (field) => field[1].length > 0,
        ),
        requestBody = Object.fromEntries(newValues);

      try {
        const updateRequest: Response = await fetch("/api/profile", {
            method: "PATCH",
            headers: {
              Authorization: accessToken,
              "Content-type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }),
          updateResponse = await updateRequest.json();

        if (!updateRequest.ok) {
          toast.error(updateResponse.error);
          return;
        }

        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error((error as Error).message);
      }
    },
    deleteHandler = async () => {
      try {
        const deleteRequest: Response = await fetch("/api/profile", {
            method: "DELETE",
            headers: {
              Authorization: accessToken,
            },
          }),
          deleteResponse = await deleteRequest.json();

        if (!deleteRequest.ok) {
          toast.error(`${deleteResponse.error}`);
          return;
        }

        toast.success(`Account deleted successfully`);
        localStorage.clear();

        setTimeout(() => {
          router.push("/auth/login");
        }, 2500);
      } catch (error) {
        toast.error(`${(error as Error).message}`);
      }
    };

  return (
    <div ref={ref} id="edit-container" className={className}>
      <div id="background" className={styles.modalBackground} />

      <div id="image" className={styles.modalInfo}>
        <img
          className={styles.modalImage}
          src={profileImage}
          alt="profile image"
        />
        <div id="current-info">
          <h3>{username}</h3>
          <h4>{email}</h4>
        </div>
      </div>
      <div id="info" className={styles.modalInput}>
        <div>
          <Label>Username</Label>
          <Input
            onChange={(event) => inputHandler(event, "username")}
            type="text"
            placeholder={username}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            onChange={(event) => inputHandler(event, "email")}
            type="text"
            placeholder={email}
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="text"
            onChange={(event) => inputHandler(event, "email")}
            placeholder={"New password here"}
          />
        </div>
        <div>
          <Label>Profile Photo</Label>
          <Input
            onChange={(event) => inputHandler(event, "profileImage")}
            type="file"
          />
        </div>
      </div>
      <div id="buttons" className={styles.modalButtons}>
        <Button onClick={submitHandler}>Save Changes</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled onClick={deleteHandler}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

const Profile = (): React.ReactNode => {
  const [modal, setModal] = useState<boolean>(false),
    modalRef = useRef<HTMLDivElement>(null),
    { username, email, profileImage, todos } = useProfile();

  const [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!modal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current) return;

      const target = event.target as Node;

      // Ignore clicks inside modal
      if (modalRef.current.contains(target)) return;

      // Ignore clicks inside AlertDialogContent
      if ((target as HTMLElement).closest('[role="dialog"]')) return;

      setModal(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modal]);

  useEffect(() => {
    setCompleted(
      todos.reduce(
        (count, todo) => (todo.status == "complete" ? count + 1 : count),
        0,
      ),
    );
    setInProgress(
      todos.reduce(
        (count, todo) => (todo.status == "in progress" ? count + 1 : count),
        0,
      ),
    );
    setCurrent(
      todos.reduce(
        (count, todo) => (todo.status == "incomplete" ? count + 1 : count),
        0,
      ),
    );
  }, [todos]);

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
          {profileImage ? (
            <img
              loading="eager"
              id="profile-page"
              className={styles.profileImg}
              src={profileImage}
              alt="profile page"
            />
          ) : (
            <Image
              loading="eager"
              id="profile-page"
              className={styles.profileImg}
              src={BackgroundImage}
              alt="profile page"
            />
          )}
        </div>
        <div id="details" className={styles.details}>
          <div id="name" className={styles.name}>
            <h2>{username}</h2>
            <p>{email}</p>
          </div>
          <div id="desc">
            <p>
              All users here are appreciated and supported all
              <br /> the way.
            </p>
            <div id="todos" className={styles.todos}>
              <div id="summary">
                <h3>{completed}</h3>
                <p>Completed</p>
              </div>
              <div id="summary">
                <h3>{inProgress}</h3>
                <p>In progress</p>
              </div>
              <div id="summary">
                <h3>{current}</h3>
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
          username={username}
          email={email}
          profileImage={profileImage}
          className={styles.modal}
        />
      )}
    </div>
  );
};

export default Profile;
