const Notification = require("../models/Notification");
const { sendNotificationToUser } = require("../socket/socketManager");

/**
 * Core helper — saves notification to DB then pushes it via Socket.io.
 * If the user is offline the DB record is still saved and they'll
 * get it via REST on next load.
 */
const createNotification = async ({
    recipient,
    sender = null,
    type,
    message,
    task = null,
    team = null,
}) => {
    try {
        if (!recipient) return null;

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            message,
            task,
            team,
        });

        // Populate before pushing so the client gets full objects
        await notification.populate("sender", "name email");
        if (task) await notification.populate("task", "title");
        if (team) await notification.populate("team", "name");

        // Real-time push
        sendNotificationToUser(recipient.toString(), notification);

        return notification;
    } catch (err) {
        console.error("Error creating notification:", err.message);
        return null;
    }
};

// ─── Task notifications ────────────────────────────────────────────

exports.notifyTaskAssigned = async ({ task, assignedTo, assignedBy }) => {
    if (!assignedTo || assignedTo.toString() === assignedBy.toString()) return;

    return createNotification({
        recipient: assignedTo,
        sender: assignedBy,
        type: "task_assigned",
        message: `You have been assigned a new task: "${task.title}"`,
        task: task._id,
        team: task.team || null,
    });
};

exports.notifyTaskUpdated = async ({ task, updatedBy }) => {
    if (!task.assignedTo) return;
    if (task.assignedTo.toString() === updatedBy.toString()) return;

    return createNotification({
        recipient: task.assignedTo,
        sender: updatedBy,
        type: "task_updated",
        message: `Task "${task.title}" has been updated`,
        task: task._id,
        team: task.team || null,
    });
};

exports.notifyTaskDeleted = async ({ taskTitle, assignedTo, deletedBy }) => {
    if (!assignedTo) return;
    if (assignedTo.toString() === deletedBy.toString()) return;

    return createNotification({
        recipient: assignedTo,
        sender: deletedBy,
        type: "task_deleted",
        message: `Task "${taskTitle}" has been deleted`,
    });
};

exports.notifyTaskStatusChanged = async ({ task, changedBy, newStatus }) => {
    if (!task.assignedTo) return;
    const notifyUser =
        task.createdBy.toString() !== changedBy.toString() ? task.createdBy : null;
    if (!notifyUser) return;

    return createNotification({
        recipient: notifyUser,
        sender: changedBy,
        type: "task_status_changed",
        message: `Task "${task.title}" status changed to "${newStatus}"`,
        task: task._id,
        team: task.team || null,
    });
};

// ─── Team notifications ────────────────────────────────────────────

exports.notifyTeamInvite = async ({ team, invitedUserId, invitedBy }) => {
    return createNotification({
        recipient: invitedUserId,
        sender: invitedBy,
        type: "team_invite",
        message: `You have been invited to join team "${team.name}"`,
        team: team._id,
    });
};

exports.notifyJoinRequest = async ({ team, requesterId }) => {
    return createNotification({
        recipient: team.leader,
        sender: requesterId,
        type: "team_join_request",
        message: `A user has requested to join your team "${team.name}"`,
        team: team._id,
    });
};

exports.notifyJoinRequestHandled = async ({ team, userId, action }) => {
    const accepted = action === "accept";
    return createNotification({
        recipient: userId,
        sender: team.leader,
        type: accepted ? "team_join_accepted" : "team_join_rejected",
        message: accepted
            ? `Your request to join "${team.name}" was accepted`
            : `Your request to join "${team.name}" was rejected`,
        team: team._id,
    });
};

exports.notifyMemberAdded = async ({ team, addedUserId, addedBy }) => {
    if (addedUserId.toString() === addedBy.toString()) return;

    return createNotification({
        recipient: addedUserId,
        sender: addedBy,
        type: "team_member_added",
        message: `You have been added to team "${team.name}"`,
        team: team._id,
    });
};

exports.notifyMemberRemoved = async ({ team, removedUserId, removedBy }) => {
    return createNotification({
        recipient: removedUserId,
        sender: removedBy,
        type: "team_member_removed",
        message: `You have been removed from team "${team.name}"`,
        team: team._id,
    });
};

// ─── Comment notifications ─────────────────────────────────────────

exports.notifyCommentAdded = async ({ task, commentBy }) => {
    if (!task.assignedTo) return;
    if (task.assignedTo.toString() === commentBy.toString()) return;

    return createNotification({
        recipient: task.assignedTo,
        sender: commentBy,
        type: "comment_added",
        message: `A comment was added on task "${task.title}"`,
        task: task._id,
    });
};
