import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import PlanLanding from "./PlanLanding";
import { useAuth } from "../contexts/AuthContext";

jest.mock("../contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const LoginTarget = () => {
  const location = useLocation();
  return (
    <output data-testid="login-target">
      {location.state.from.pathname}
      {location.state.from.search}
    </output>
  );
};

describe("PlanLanding", () => {
  beforeEach(() => {
    sessionStorage.clear();
    useAuth.mockReturnValue({ isAuthenticated: false });
  });

  it("preserves trip preferences and returns to the planner after sign-in", () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 3);
    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    render(
      <MemoryRouter initialEntries={["/plan/"]}>
        <Routes>
          <Route path="/plan/" element={<PlanLanding />} />
          <Route path="/login" element={<LoginTarget />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText("Destination"), {
      target: { value: "Jaipur" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: formatDate(startDate) },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: formatDate(endDate) },
    });
    fireEvent.change(screen.getByLabelText(/Interests/), {
      target: { value: "Food, history" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Continue to secure planner" })
    );

    expect(screen.getByTestId("login-target").textContent).toBe(
      "/trip-planner?restore=1"
    );
    expect(
      JSON.parse(sessionStorage.getItem("tripsathi-pending-itinerary")).values
    ).toMatchObject({
      destination: "Jaipur",
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      interests: ["food", "history"],
      travelers: 2,
    });
  });
});
