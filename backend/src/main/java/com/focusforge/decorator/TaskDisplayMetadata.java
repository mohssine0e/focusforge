package com.focusforge.decorator;

public class TaskDisplayMetadata {

    private String priorityLabel;
    private boolean overdue;
    private boolean dueSoon;
    private boolean dependencyWarning;
    private String blockedReason;

    public String getPriorityLabel() {
        return priorityLabel;
    }

    public void setPriorityLabel(String priorityLabel) {
        this.priorityLabel = priorityLabel;
    }

    public boolean isOverdue() {
        return overdue;
    }

    public void setOverdue(boolean overdue) {
        this.overdue = overdue;
    }

    public boolean isDueSoon() {
        return dueSoon;
    }

    public void setDueSoon(boolean dueSoon) {
        this.dueSoon = dueSoon;
    }

    public boolean isDependencyWarning() {
        return dependencyWarning;
    }

    public void setDependencyWarning(boolean dependencyWarning) {
        this.dependencyWarning = dependencyWarning;
    }

    public String getBlockedReason() {
        return blockedReason;
    }

    public void setBlockedReason(String blockedReason) {
        this.blockedReason = blockedReason;
    }
}
