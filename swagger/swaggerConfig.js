const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Management API",
            version: "1.0.0",
            description:
                "API documentation for the Task Management system including tasks, teams, notifications, comments and activities",
        },
        servers: [
            {
                url: "https://saas-task-management-api.onrender.com",
                description: "Production server",
            },
            {
                url: "http://localhost:3000",
                description: "Local development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                // ── User ──────────────────────────────────────────────
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        name: { type: "string", example: "John Doe" },
                        email: { type: "string", example: "john@example.com" },
                        role: { type: "string", enum: ["user", "admin"], example: "user" },
                        mobile: { type: "string", example: "01012345678" },        // ← NEW
                        gender: { type: "string", enum: ["male", "female", "other"], example: "male" }, // ← NEW
                        isVerified: { type: "boolean", example: false },               // ← NEW
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ── Task ──────────────────────────────────────────────
                Task: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        title: { type: "string", example: "Fix login bug" },
                        description: { type: "string", example: "The login button is broken on mobile" },
                        type: { type: "string", enum: ["personal", "team"] },
                        status: { type: "string", enum: ["pending", "in progress", "completed"] },
                        priority: { type: "string", enum: ["low", "medium", "high"] },
                        dueDate: { type: "string", format: "date-time" },
                        createdBy: { $ref: "#/components/schemas/User" },
                        assignedTo: { $ref: "#/components/schemas/User" },
                        team: { $ref: "#/components/schemas/Team" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ── Team ──────────────────────────────────────────────
                Team: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        name: { type: "string", example: "Frontend Team" },
                        description: { type: "string", example: "Handles all frontend tasks" },
                        type: { type: "string", enum: ["public", "private"] },
                        leader: { $ref: "#/components/schemas/User" },
                        members: { type: "array", items: { $ref: "#/components/schemas/User" } },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ── Notification ──────────────────────────────────────
                Notification: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        recipient: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        sender: { $ref: "#/components/schemas/User" },
                        type: {
                            type: "string",
                            enum: [
                                "task_assigned",
                                "task_updated",
                                "task_deleted",
                                "task_status_changed",
                                "team_invite",
                                "team_join_request",
                                "team_join_accepted",
                                "team_join_rejected",
                                "team_member_added",
                                "team_member_removed",
                                "comment_added",
                            ],
                        },
                        message: { type: "string", example: "You have been assigned a new task" },
                        read: { type: "boolean", example: false },
                        task: { $ref: "#/components/schemas/Task" },
                        team: { $ref: "#/components/schemas/Team" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ── Comment ───────────────────────────────────────────
                Comment: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        task: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        user: { $ref: "#/components/schemas/User" },
                        text: { type: "string", example: "This task needs more details" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                // ── Activity ──────────────────────────────────────────
                Activity: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "64a1b2c3d4e5f6a7b8c9d0e1" },
                        task: { $ref: "#/components/schemas/Task" },
                        user: { $ref: "#/components/schemas/User" },
                        action: {
                            type: "string",
                            enum: ["created", "updated", "deleted", "commented", "assigned"],
                        },
                        details: { type: "string", example: "Task status changed to completed" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);