package com.focusforge.config;

import com.focusforge.entity.FocusSession;
import com.focusforge.entity.FocusSessionType;
import com.focusforge.entity.Notification;
import com.focusforge.entity.NotificationType;
import com.focusforge.entity.Priority;
import com.focusforge.entity.Project;
import com.focusforge.entity.ProjectStatus;
import com.focusforge.entity.Task;
import com.focusforge.entity.TaskStatus;
import com.focusforge.entity.TaskType;
import com.focusforge.entity.Workspace;
import com.focusforge.repository.FocusSessionRepository;
import com.focusforge.repository.NotificationRepository;
import com.focusforge.repository.ProjectRepository;
import com.focusforge.repository.TaskRepository;
import com.focusforge.repository.WorkspaceRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEMO_WORKSPACE_NAME = "FocusForge Demo";
    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final WorkspaceRepository workspaceRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final FocusSessionRepository focusSessionRepository;
    private final NotificationRepository notificationRepository;

    public DemoDataSeeder(WorkspaceRepository workspaceRepository,
                          ProjectRepository projectRepository,
                          TaskRepository taskRepository,
                          FocusSessionRepository focusSessionRepository,
                          NotificationRepository notificationRepository) {
        this.workspaceRepository = workspaceRepository;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.focusSessionRepository = focusSessionRepository;
        this.notificationRepository = notificationRepository;
    }

    @Override
    public void run(String... args) {
        if (workspaceRepository.existsByName(DEMO_WORKSPACE_NAME)) {
            log.info("Demo data already exists");
            return;
        }

        Workspace workspace = workspaceRepository.save(new Workspace(
                DEMO_WORKSPACE_NAME,
                "Seeded workspace for a rich FocusForge dashboard and project demo."
        ));

        List<Project> projects = projectRepository.saveAll(List.of(
                new Project("Portfolio Website", "React portfolio redesign with case studies and deployment.", ProjectStatus.IN_PROGRESS, Priority.HIGH, daysFromNow(-12), daysFromNow(9), workspace),
                new Project("Data Structures Course", "Assignments, algorithms practice, and exam preparation.", ProjectStatus.IN_PROGRESS, Priority.HIGH, daysFromNow(-30), daysFromNow(15), workspace),
                new Project("Mobile App Project", "Planner prototype for engineering student routines.", ProjectStatus.ON_HOLD, Priority.MEDIUM, daysFromNow(-20), daysFromNow(24), workspace),
                new Project("System Design Study", "Backend architecture notes, diagrams, and mock interviews.", ProjectStatus.IN_PROGRESS, Priority.MEDIUM, daysFromNow(-8), daysFromNow(30), workspace),
                new Project("Machine Learning Basics", "Model training foundations and notebook exercises.", ProjectStatus.ON_HOLD, Priority.LOW, daysFromNow(-45), daysFromNow(42), workspace),
                new Project("Backend API Integration", "Spring Boot service polish and validation coverage.", ProjectStatus.PLANNED, Priority.URGENT, daysFromNow(-3), daysFromNow(4), workspace)
        ));

        List<Task> tasks = new ArrayList<>();
        tasks.addAll(tasksFor(projects.get(0), List.of(
                task("Landing page hero", "Build dashboard-inspired landing section.", TaskStatus.DONE, Priority.HIGH, TaskType.CODING, -4, 120),
                task("Case study cards", "Polish project cards and badges.", TaskStatus.IN_PROGRESS, Priority.HIGH, TaskType.CODING, 2, 90),
                task("Deploy portfolio", "Final production deploy and smoke test.", TaskStatus.TODO, Priority.MEDIUM, TaskType.ADMIN, 8, 45)
        )));
        tasks.addAll(tasksFor(projects.get(1), List.of(
                task("Data Structures Assignment", "Trees, heaps, and graph traversal exercises.", TaskStatus.TODO, Priority.HIGH, TaskType.STUDY, 1, 120),
                task("Algorithm Practice", "Timed practice on sorting and dynamic programming.", TaskStatus.IN_PROGRESS, Priority.MEDIUM, TaskType.STUDY, 5, 90),
                task("Math Exam Preparation", "Review recurrence relations and complexity proofs.", TaskStatus.REVIEW, Priority.MEDIUM, TaskType.STUDY, 11, 150),
                task("Submit lab report", "Attach complexity analysis and screenshots.", TaskStatus.BLOCKED, Priority.HIGH, TaskType.ADMIN, -1, 30)
        )));
        tasks.addAll(tasksFor(projects.get(2), List.of(
                task("Mobile App Project", "Finalize project brief and screen map.", TaskStatus.TODO, Priority.MEDIUM, TaskType.RESEARCH, 7, 60),
                task("Authentication flow", "Sketch login and session screens.", TaskStatus.BLOCKED, Priority.HIGH, TaskType.CODING, 16, 90)
        )));
        tasks.addAll(tasksFor(projects.get(3), List.of(
                task("System Design Document", "Document service boundaries and database choices.", TaskStatus.REVIEW, Priority.LOW, TaskType.RESEARCH, 16, 75),
                task("UI/UX Design System", "Normalize spacing, colors, and empty states.", TaskStatus.IN_PROGRESS, Priority.HIGH, TaskType.CODING, 3, 110),
                task("Mock interview prep", "Practice rate limiter and notification system design.", TaskStatus.TODO, Priority.MEDIUM, TaskType.STUDY, 12, 60)
        )));
        tasks.addAll(tasksFor(projects.get(4), List.of(
                task("Linear regression notes", "Summarize assumptions and examples.", TaskStatus.DONE, Priority.LOW, TaskType.STUDY, -6, 80),
                task("Notebook cleanup", "Clean notebook output and headings.", TaskStatus.TODO, Priority.LOW, TaskType.ADMIN, 23, 45)
        )));
        tasks.addAll(tasksFor(projects.get(5), List.of(
                task("Backend API Integration", "Connect remaining dashboard widgets to live data.", TaskStatus.IN_PROGRESS, Priority.URGENT, TaskType.CODING, 4, 105),
                task("Controller smoke tests", "Verify important endpoints and error envelopes.", TaskStatus.DONE, Priority.HIGH, TaskType.CODING, -2, 90),
                task("Validation polish", "Improve invalid-state messages across flows.", TaskStatus.TODO, Priority.HIGH, TaskType.CODING, 6, 75)
        )));

        List<Task> savedTasks = taskRepository.saveAll(tasks);
        seedFocusSessions(savedTasks);
        seedNotifications();
        log.info("Seeded FocusForge demo data");
    }

    private List<Task> tasksFor(Project project, List<Task> tasks) {
        tasks.forEach(task -> task.setProject(project));
        return tasks;
    }

    private Task task(String title, String description, TaskStatus status, Priority priority,
                      TaskType type, int dueOffsetDays, int estimatedMinutes) {
        return new Task(title, description, status, type, priority, daysFromNow(dueOffsetDays), estimatedMinutes, null);
    }

    private void seedFocusSessions(List<Task> tasks) {
        List<Task> focusTasks = tasks.stream().limit(8).toList();
        List<FocusSession> sessions = new ArrayList<>();
        int[] durations = {135, 105, 90, 120, 80, 65, 110, 95};
        FocusSessionType[] types = {
                FocusSessionType.DEEP_WORK,
                FocusSessionType.DEEP_WORK,
                FocusSessionType.POMODORO,
                FocusSessionType.DEEP_WORK,
                FocusSessionType.QUICK_FOCUS,
                FocusSessionType.POMODORO,
                FocusSessionType.DEEP_WORK,
                FocusSessionType.POMODORO
        };

        for (int index = 0; index < focusTasks.size(); index++) {
            LocalDateTime start = LocalDateTime.now().minusDays(index / 2L).minusHours(2L + index);
            FocusSession session = new FocusSession(focusTasks.get(index), start, types[index]);
            session.setDurationMinutes(durations[index]);
            session.setEndTime(start.plusMinutes(durations[index]));
            session.setCompleted(true);
            sessions.add(session);
        }

        focusSessionRepository.saveAll(sessions);
    }

    private void seedNotifications() {
        List<Notification> notifications = List.of(
                new Notification("Backend API Integration moved to IN_PROGRESS", NotificationType.TASK_UPDATED),
                new Notification("UI/UX Design System is due soon", NotificationType.DEADLINE_WARNING),
                new Notification("Submit lab report is blocked by unfinished work", NotificationType.TASK_BLOCKED),
                new Notification("Controller smoke tests completed", NotificationType.TASK_COMPLETED),
                new Notification("Data Structures Assignment is due tomorrow", NotificationType.DEADLINE_WARNING)
        );
        notificationRepository.saveAll(notifications);
    }

    private LocalDateTime daysFromNow(int days) {
        return LocalDateTime.now().plusDays(days).withHour(17).withMinute(0).withSecond(0).withNano(0);
    }
}
