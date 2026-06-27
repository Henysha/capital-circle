package com.capitalcircle.service;

import com.capitalcircle.domain.AppUser;
import com.capitalcircle.domain.CapitalGroup;
import com.capitalcircle.domain.GroupMember;
import com.capitalcircle.domain.GroupRole;
import com.capitalcircle.dto.GroupDtos.CreateGroupRequest;
import com.capitalcircle.dto.GroupDtos.GroupResponse;
import com.capitalcircle.exception.BusinessException;
import com.capitalcircle.repository.CapitalGroupRepository;
import com.capitalcircle.repository.GroupMemberRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final CapitalGroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final AuthService authService;

    @Transactional
    public GroupResponse create(CreateGroupRequest request) {
        AppUser user = authService.currentUser();

        CapitalGroup group = new CapitalGroup();
        group.setName(request.name().trim());
        group.setDescription(request.description());
        group.setContributionGoal(request.contributionGoal());
        group.setCreatedBy(user);
        CapitalGroup savedGroup = groupRepository.save(group);

        GroupMember member = new GroupMember();
        member.setGroup(savedGroup);
        member.setUser(user);
        member.setRole(GroupRole.ADMIN);
        member.setJoinedAt(LocalDateTime.now());
        memberRepository.save(member);

        return toResponse(savedGroup, GroupRole.ADMIN);
    }

    @Transactional(readOnly = true)
    public List<GroupResponse> listMine() {
        AppUser user = authService.currentUser();
        return groupRepository.findGroupsForUser(user.getId()).stream()
            .map(group -> toResponse(group, roleFor(group.getId(), user.getId())))
            .toList();
    }

    @Transactional(readOnly = true)
    public GroupResponse get(UUID groupId) {
        AppUser user = authService.currentUser();
        CapitalGroup group = getGroupOrThrow(groupId);
        return toResponse(group, roleFor(groupId, user.getId()));
    }

    @Transactional
    public GroupResponse join(UUID groupId) {
        AppUser user = authService.currentUser();
        CapitalGroup group = getGroupOrThrow(groupId);
        if (memberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "You are already a member of this group");
        }

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setUser(user);
        member.setRole(GroupRole.MEMBER);
        member.setJoinedAt(LocalDateTime.now());
        memberRepository.save(member);

        return toResponse(group, GroupRole.MEMBER);
    }

    public CapitalGroup getGroupOrThrow(UUID groupId) {
        return groupRepository.findById(groupId)
            .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Group not found"));
    }

    public void requireMembership(UUID groupId, UUID userId) {
        if (!memberRepository.existsByGroupIdAndUserId(groupId, userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "You must be a group member to perform this action");
        }
    }

    public void requireAdmin(UUID groupId, UUID userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndRole(groupId, userId, GroupRole.ADMIN)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Only group admins can perform this action");
        }
    }

    private GroupRole roleFor(UUID groupId, UUID userId) {
        return memberRepository.findByGroupIdAndUserId(groupId, userId)
            .map(GroupMember::getRole)
            .orElseThrow(() -> new BusinessException(HttpStatus.FORBIDDEN, "You are not a member of this group"));
    }

    private GroupResponse toResponse(CapitalGroup group, GroupRole currentUserRole) {
        return new GroupResponse(
            group.getId(),
            group.getName(),
            group.getDescription(),
            group.getContributionGoal(),
            group.getCreatedBy().getId(),
            currentUserRole,
            group.getCreatedAt()
        );
    }
}
