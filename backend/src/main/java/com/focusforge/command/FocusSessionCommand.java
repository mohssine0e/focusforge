package com.focusforge.command;

import com.focusforge.dto.FocusSessionResponse;

public interface FocusSessionCommand {
    FocusSessionResponse execute();

    String getHistoryEntry();
}
