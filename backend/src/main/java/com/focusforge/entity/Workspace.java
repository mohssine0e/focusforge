package com.focusforge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "workspaces")
public class Workspace extends BaseEntity {

    @NotBlank(message = "Workspace name is required")
    @Size(min = 1, max = 100, message = "Workspace name must be between 1 and 100 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    // Constructors
    public Workspace() {
        super();
    }

    public Workspace(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public Workspace(String name, String description, AppUser owner) {
        this.name = name;
        this.description = description;
        this.owner = owner;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(AppUser owner) {
        this.owner = owner;
    }

    @Override
    public String toString() {
        return "Workspace{" +
                "id=" + getId() +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
}
