import {Router} from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { createApplicationHandler, listApplicationsHandler, getApplicationByIdHandler, deleteApplicationByIdHandler, updateApplicationByIdHandler } from './applications.controller';

const router = Router();
router.use(requireAuth);
router.post("/", createApplicationHandler);
router.get("/", listApplicationsHandler);
router.get("/:id", getApplicationByIdHandler);
router.delete("/:id", deleteApplicationByIdHandler);
router.patch("/:id", updateApplicationByIdHandler);

export default router;