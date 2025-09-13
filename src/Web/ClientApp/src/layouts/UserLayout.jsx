import { Container } from "reactstrap";
import NavMenu from "../components/NavMenu";
import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div>
      <NavMenu />
      <Container tag="main">
        <Outlet />
      </Container>
    </div>
  );
}

export default UserLayout;
