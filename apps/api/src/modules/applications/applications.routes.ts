import {Router} from 'express';
import { requireAuth } from '../../middleware/requireAuth.js';
import { createApplicationHandler, listApplicationsHandler, getApplicationByIdHandler, deleteApplicationByIdHandler, updateApplicationByIdHandler, getApplicationStatsHandler } from './applications.controller.js';

const router = Router();
router.use(requireAuth);
router.post("/", createApplicationHandler);
router.get("/", listApplicationsHandler);
router.get("/stats", getApplicationStatsHandler);
router.get("/:id", getApplicationByIdHandler);
router.delete("/:id", deleteApplicationByIdHandler);
router.patch("/:id", updateApplicationByIdHandler);

export default router;