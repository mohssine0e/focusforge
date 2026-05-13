package com.focusforge.builder;

import com.focusforge.entity.Project;
import com.focusforge.entity.ProjectStatus;
import com.focusforge.entity.Priority;
import com.focusforge.entity.Workspace;
import com.focusforge.entity.Project;
import java.time.LocalDateTime;

public class ProjectBuilder {

    public static class Builder {
        private String name;
        private String description;
        private ProjectStatus status;
        private Priority priority;
        private LocalDateTime startDate;
        private LocalDateTime dueDate;
        private Workspace workspace;

        public Builder() {
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder status(ProjectStatus status) {
            this.status = status;
            return this;
        }

        public Builder priority(Priority priority) {
            this.priority = priority;
            return this;
        }

        public Builder startDate(LocalDateTime startDate) {
            this.startDate = startDate;
            return this;
        }

        public Builder dueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
            return this;
        }

        public Builder workspace(Workspace workspace) {
            this.workspace = workspace;
            return this;
        }

        public Project build() {
            return new Project(name, description, status, priority, startDate, dueDate, workspace);
        }
    }
}