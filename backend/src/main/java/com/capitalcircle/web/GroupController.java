package com.capitalcircle.web;

import com.capitalcircle.dto.GroupDtos.CreateGroupRequest;
import com.capitalcircle.dto.GroupDtos.GroupResponse;
import com.capitalcircle.service.GroupService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    GroupResponse create(@Valid @RequestBody CreateGroupRequest request) {
        return groupService.create(request);
    }

    @GetMapping
    List<GroupResponse> listMine() {
        return groupService.listMine();
    }

    @GetMapping("/{id}")
    GroupResponse get(@PathVariable UUID id) {
        return groupService.get(id);
    }

    @PostMapping("/{id}/join")
    GroupResponse join(@PathVariable UUID id) {
        return groupService.join(id);
    }
}
