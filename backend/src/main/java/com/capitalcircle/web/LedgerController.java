package com.capitalcircle.web;

import com.capitalcircle.dto.LedgerDtos.BalanceResponse;
import com.capitalcircle.dto.LedgerDtos.LedgerEntryResponse;
import com.capitalcircle.service.LedgerService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups/{groupId}")
@RequiredArgsConstructor
public class LedgerController {
    private final LedgerService ledgerService;

    @GetMapping("/ledger")
    List<LedgerEntryResponse> ledger(@PathVariable UUID groupId) {
        return ledgerService.list(groupId);
    }

    @GetMapping("/balance")
    BalanceResponse balance(@PathVariable UUID groupId) {
        return ledgerService.balance(groupId);
    }
}
