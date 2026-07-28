import { render, screen } from "@testing-library/react";
import ProfileAvatar from "@/app/components/ProfileAvatar";

describe("ProfileAvatar", () => {
  it("renders initials when no image is provided", () => {
    render(<ProfileAvatar initials="TU" />);
    expect(screen.getByText("TU")).toBeInTheDocument();
  });

  it("renders an image when src is provided", () => {
    render(
      <ProfileAvatar
        initials="TU"
        src="https://example.com/avatar.jpg"
      />
    );

    const image = screen.getByRole("img", { name: "Profile" });
    expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("applies the selected size classes", () => {
    const { container } = render(<ProfileAvatar initials="TU" size="md" />);
    expect(container.firstChild).toHaveClass("h-24", "w-24");
  });
});
