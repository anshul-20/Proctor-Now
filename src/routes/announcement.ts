import { Router } from "express";
import { Announcement } from "../controllers/Announcement";

const router = Router();

router.get("/", Announcement.showAllAnnoucements);
router.get("/add", Announcement.addAnnouncement);
router.post("/add", Announcement.addAnnouncementCallback);
router.get("/edit/:announcementId", Announcement.editAnnouncement);
router.post("/edit", Announcement.editAnnouncementCallback);
router.delete("/delete/:announcementId", Announcement.deleteAnnouncement);

export default router;
