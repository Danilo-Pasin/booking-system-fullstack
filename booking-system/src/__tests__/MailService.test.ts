import { describe, it, expect, vi, beforeEach } from "vitest";
import { MailService } from "../infra/mail/MailService";

const sendMailSpy = vi.fn().mockResolvedValue({ messageId: "mock-message-id" });

vi.mock("nodemailer", () => {
  const createTransport = vi.fn(() => ({
    sendMail: sendMailSpy,
  }));

  return {
    default: {
      createTransport,
      createTestAccount: vi.fn().mockResolvedValue({
        user: "test@ethereal.email",
        pass: "test-password",
      }),
      getTestMessageUrl: vi.fn(() => "https://ethereal.email/mock-preview"),
    },
    createTransport,
  };
});

describe("MailService", () => {
  let mailService: MailService;

  beforeEach(() => {
    vi.clearAllMocks();
    mailService = new MailService();
  });

  it("initializes with Ethereal and sends email", async () => {
    await mailService.initialize();

    await expect(
      mailService.send("guest@test.com", "Test Subject", "<p>Test</p>"),
    ).resolves.toBeUndefined();
  });

  it("does not throw when sending without initialization (logs warning)", async () => {
    await expect(
      mailService.send("guest@test.com", "Test", "<p>Test</p>"),
    ).resolves.toBeUndefined();
  });

  it("sends email with correct parameters", async () => {
    await mailService.initialize();

    await mailService.send("guest@test.com", "Subject", "<h1>Hello</h1>");

    expect(sendMailSpy).toHaveBeenCalledWith({
      from: "noreply@booking.com",
      to: "guest@test.com",
      subject: "Subject",
      html: "<h1>Hello</h1>",
    });
  });
});
