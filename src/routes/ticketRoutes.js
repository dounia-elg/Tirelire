import express from "express";
import TicketController from "../controllers/ticketController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", authenticateToken, TicketController.createTicket);
router.get("/", authenticateToken, TicketController.getUserTickets);
router.get("/admin", authenticateToken, TicketController.listAllTickets);
router.get("/:ticketId", authenticateToken, TicketController.getTicket);
router.patch("/:ticketId/respond", authenticateToken, TicketController.respondToTicket);

export default router;


