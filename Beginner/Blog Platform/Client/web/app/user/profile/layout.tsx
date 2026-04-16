import Navbar from "@/app/_Components/Navbar";

const Layout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  return (
    <div>
      <Navbar />
      <div className="relative top-20">{children}</div>
    </div>
  );
};

export default Layout;
