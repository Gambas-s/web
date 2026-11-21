import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const REQUIRED_SCREENS = ['홈', '채팅', '소각 진행', '소각 완료', '소각 기록'];
const REQUIRED_FINDINGS = [
  '세션 만료',
  '세션 생성 실패',
  '구긴 선택 새로고침',
  '소각 기록',
  '연속 일수·평균',
  '자동 소각 시계',
  '새 쓰레기통',
  '프로필',
];
const SCREEN_HEADERS = ['화면', '모바일 점검 범위', '데스크톱 점검 범위'];
const FINDING_HEADERS = [
  '위치 또는 재현 방법',
  '현재 동작',
  '기대 동작',
  '검증 조건',
];
const TRACE_HEADERS = [
  '승인 조건',
  '구현 TODO',
  '자동 테스트 명령',
  'QA 시나리오',
  '증거 경로',
];
const EXPECTED_TRACE = {
  'AC-001': { dev: ['DEV-003'], qa: ['QA-N-002'] },
  'AC-002': { dev: ['DEV-002', 'DEV-004'], qa: ['QA-N-001'] },
  'AC-003': { dev: ['DEV-002', 'DEV-004'], qa: ['QA-N-001'] },
  'AC-004': { dev: ['DEV-002', 'DEV-004'], qa: ['QA-N-001'] },
  'AC-005': { dev: ['DEV-002', 'DEV-004'], qa: ['QA-F-001'] },
  'AC-006': {
    dev: ['DEV-001', 'DEV-002', 'DEV-004'],
    qa: ['QA-F-001'],
  },
  'AC-007': {
    dev: ['DEV-001', 'DEV-003', 'DEV-004'],
    qa: ['QA-N-001', 'QA-F-002'],
  },
  'AC-008': { dev: ['DEV-003', 'DEV-004'], qa: ['QA-N-001'] },
  'AC-009': { dev: ['DEV-003', 'DEV-004'], qa: [] },
  'AC-010': { dev: ['DEV-005'], qa: ['QA-N-003'] },
};

function fail(messages) {
  for (const message of messages) {
    console.error(`오류: ${message}`);
  }
  process.exitCode = 1;
}

function getSection(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line.trim() === headingLine);

  if (start === -1) {
    return null;
  }

  const endOffset = lines
    .slice(start + 1)
    .findIndex((line) => /^##\s+/.test(line.trim()));
  const end = endOffset === -1 ? lines.length : start + 1 + endOffset;
  return lines.slice(start + 1, end);
}

function splitTableRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) {
    return null;
  }

  return trimmed
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function extractTable(sectionLines, expectedHeaders, tableName, errors) {
  if (!sectionLines) {
    errors.push(`'${tableName}' 섹션이 없습니다.`);
    return [];
  }

  const headerIndex = sectionLines.findIndex((line) => {
    const cells = splitTableRow(line);
    return cells && cells.join('\u0000') === expectedHeaders.join('\u0000');
  });

  if (headerIndex === -1) {
    errors.push(
      `'${tableName}' 표 머리글은 ${expectedHeaders.join(' / ')} 순서여야 합니다.`,
    );
    return [];
  }

  const separator = splitTableRow(sectionLines[headerIndex + 1] ?? '');
  if (
    !separator ||
    separator.length !== expectedHeaders.length ||
    !isSeparatorRow(separator)
  ) {
    errors.push(`'${tableName}' 표의 구분선이 올바르지 않습니다.`);
    return [];
  }

  const rows = [];
  for (const [offset, line] of sectionLines.slice(headerIndex + 2).entries()) {
    if (line.trim() === '') {
      continue;
    }

    const cells = splitTableRow(line);
    if (!cells) {
      errors.push(
        `'${tableName}' 표의 ${offset + 1}번째 데이터 줄을 표 행으로 읽을 수 없습니다.`,
      );
      continue;
    }
    rows.push(cells);
  }

  if (rows.length === 0) {
    errors.push(`'${tableName}' 표에 데이터 행이 없습니다.`);
  }
  return rows;
}

function isMeaningful(cell) {
  const visibleText = cell
    .replace(/!?(?:\[([^\]]*)\])\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/[*_`~]/g, '')
    .replace(/&nbsp;/gi, '')
    .trim();

  return visibleText !== '' && !/^(?:-|—|–|n\/?a|없음|미정)$/i.test(visibleText);
}

async function validateLocalLinks(markdown, reportPath, errors) {
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const localTargets = new Set();

  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1];
    if (/^(?:[a-z][a-z\d+.-]*:|#|\/)/i.test(target)) continue;
    localTargets.add(target.split(/[?#]/, 1)[0]);
  }

  for (const target of localTargets) {
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(target);
    } catch {
      errors.push(`상대 경로 링크를 해석할 수 없습니다: ${target}`);
      continue;
    }

    try {
      await access(resolve(dirname(reportPath), decodedTarget));
    } catch {
      errors.push(`상대 경로 링크 대상이 없습니다: ${target}`);
    }
  }

  return localTargets.size;
}

async function validateAudit(markdown, reportPath) {
  const errors = [];
  const screenRows = extractTable(
    getSection(markdown, '화면별 점검 범위'),
    SCREEN_HEADERS,
    '화면별 점검 범위',
    errors,
  );
  const findingRows = extractTable(
    getSection(markdown, '발견 사항'),
    FINDING_HEADERS,
    '발견 사항',
    errors,
  );

  screenRows.forEach((cells, index) => {
    if (cells.length !== SCREEN_HEADERS.length) {
      errors.push(
        `화면별 점검 범위 ${index + 1}행은 ${SCREEN_HEADERS.length}개 필드여야 하지만 ${cells.length}개입니다.`,
      );
      return;
    }
    cells.forEach((cell, cellIndex) => {
      if (!isMeaningful(cell)) {
        errors.push(
          `화면별 점검 범위 ${index + 1}행의 '${SCREEN_HEADERS[cellIndex]}'이 비어 있습니다.`,
        );
      }
    });
  });

  for (const screen of REQUIRED_SCREENS) {
    const matchingRows = screenRows.filter((cells) => cells[0]?.trim() === screen);
    if (matchingRows.length === 0) {
      errors.push(`필수 화면 '${screen}'의 점검 범위가 없습니다.`);
    } else if (matchingRows.length > 1) {
      errors.push(`필수 화면 '${screen}'의 점검 범위가 중복되어 있습니다.`);
    }
  }

  findingRows.forEach((cells, index) => {
    if (cells.length !== FINDING_HEADERS.length) {
      errors.push(
        `발견 사항 ${index + 1}행은 ${FINDING_HEADERS.length}개 필드여야 하지만 ${cells.length}개입니다.`,
      );
      return;
    }
    cells.forEach((cell, cellIndex) => {
      if (!isMeaningful(cell)) {
        errors.push(
          `발견 사항 ${index + 1}행의 '${FINDING_HEADERS[cellIndex]}'이 비어 있습니다.`,
        );
      }
    });
  });

  const flattenedFindings = findingRows.flat().join(' ');
  for (const finding of REQUIRED_FINDINGS) {
    if (!flattenedFindings.includes(finding)) {
      errors.push(`필수 후속 후보 '${finding}'이 발견 사항 표에 없습니다.`);
    }
  }

  const environmentSection = getSection(markdown, '점검 환경과 제한');
  if (!environmentSection) {
    errors.push(`'점검 환경과 제한' 섹션이 없습니다.`);
  } else {
    const environmentText = environmentSection.join('\n');
    for (const target of ['모바일', '데스크톱']) {
      if (!environmentText.includes(target)) {
        errors.push(`점검 환경과 제한에 '${target}' 환경이 기록되지 않았습니다.`);
      }
    }
  }

  const localLinkCount = await validateLocalLinks(markdown, reportPath, errors);

  if (errors.length > 0) {
    fail(errors);
    return;
  }

  console.log(
    `기능 점검 보고서 검증 통과: 필수 화면 ${REQUIRED_SCREENS.length}개, 발견 사항 ${findingRows.length}개, 상대 경로 링크 ${localLinkCount}개`,
  );
}

function extractIds(cell, pattern) {
  return [...cell.matchAll(pattern)].map((match) => match[0]);
}

function hasLocalMarkdownLink(cell) {
  return /!?(?:\[[^\]]*\])\((?![a-z][a-z\d+.-]*:|#|\/)[^)]+\)/i.test(
    cell,
  );
}

async function validateTrace(markdown, reportPath) {
  const errors = [];
  const traceRows = extractTable(
    getSection(markdown, '검증 추적표'),
    TRACE_HEADERS,
    '검증 추적표',
    errors,
  );
  const rowsByAcceptanceCondition = new Map();

  traceRows.forEach((cells, index) => {
    if (cells.length !== TRACE_HEADERS.length) {
      errors.push(
        `검증 추적표 ${index + 1}행은 ${TRACE_HEADERS.length}개 필드여야 하지만 ${cells.length}개입니다.`,
      );
      return;
    }

    const acceptanceCondition = cells[0].match(/\bAC-\d{3}\b/)?.[0];
    if (!acceptanceCondition) {
      errors.push(`검증 추적표 ${index + 1}행에 AC 식별자가 없습니다.`);
      return;
    }

    const matchingRows = rowsByAcceptanceCondition.get(acceptanceCondition) ?? [];
    matchingRows.push({ cells, index });
    rowsByAcceptanceCondition.set(acceptanceCondition, matchingRows);

    for (const cellIndex of [0, 1, 4]) {
      if (!isMeaningful(cells[cellIndex])) {
        errors.push(
          `검증 추적표 ${index + 1}행의 '${TRACE_HEADERS[cellIndex]}'이 비어 있습니다.`,
        );
      }
    }

    const devIds = extractIds(cells[1], /\bDEV-\d{3}\b/g);
    const qaIds = extractIds(cells[3], /\bQA-[NF]-\d{3}\b/g);
    const hasAutomatedCommand = /`[^`]*(?:pnpm|node)[^`]*`/.test(cells[2]);
    const hasEvidencePath = hasLocalMarkdownLink(cells[4]);

    if (devIds.length === 0) {
      errors.push(
        `검증 추적표 ${index + 1}행의 '구현 TODO'에 DEV ID가 없습니다.`,
      );
    }
    if (!hasAutomatedCommand && !(qaIds.length > 0 && hasEvidencePath)) {
      errors.push(
        `검증 추적표 ${index + 1}행에 자동 테스트 명령 또는 QA ID와 증거 경로 연결이 없습니다.`,
      );
    }
    if (!hasEvidencePath) {
      errors.push(`검증 추적표 ${index + 1}행에 상대 경로 증거 링크가 없습니다.`);
    }
  });

  for (const [acceptanceCondition, expected] of Object.entries(
    EXPECTED_TRACE,
  )) {
    const matchingRows = rowsByAcceptanceCondition.get(acceptanceCondition) ?? [];
    if (matchingRows.length === 0) {
      errors.push(`필수 승인 조건 '${acceptanceCondition}' 추적 행이 없습니다.`);
      continue;
    }
    if (matchingRows.length > 1) {
      errors.push(`필수 승인 조건 '${acceptanceCondition}' 추적 행이 중복되어 있습니다.`);
      continue;
    }

    const [, devCell, , qaCell] = matchingRows[0].cells;
    for (const devId of expected.dev) {
      if (!extractIds(devCell, /\bDEV-\d{3}\b/g).includes(devId)) {
        errors.push(`${acceptanceCondition}에 필수 구현 TODO '${devId}'가 없습니다.`);
      }
    }
    for (const qaId of expected.qa) {
      if (!extractIds(qaCell, /\bQA-[NF]-\d{3}\b/g).includes(qaId)) {
        errors.push(`${acceptanceCondition}에 필수 QA 시나리오 '${qaId}'가 없습니다.`);
      }
    }
  }

  for (const acceptanceCondition of rowsByAcceptanceCondition.keys()) {
    if (!Object.hasOwn(EXPECTED_TRACE, acceptanceCondition)) {
      errors.push(`예상하지 않은 승인 조건 '${acceptanceCondition}' 추적 행이 있습니다.`);
    }
  }

  const localLinkCount = await validateLocalLinks(markdown, reportPath, errors);
  if (errors.length > 0) {
    fail(errors);
    return;
  }

  console.log(
    `검증 추적표 검증 통과: 승인 조건 ${Object.keys(EXPECTED_TRACE).length}개, 상대 경로 링크 ${localLinkCount}개`,
  );
}

const args = process.argv.slice(2);
if (args.length !== 3 || args[0] !== '--mode') {
  fail([
    '사용법: node validate-report.mjs --mode <audit|trace> <기능-점검.md 경로>',
  ]);
} else if (!['audit', 'trace'].includes(args[1])) {
  fail([`지원하지 않는 검증 모드입니다: ${args[1]}`]);
} else {
  try {
    const markdown = await readFile(args[2], 'utf8');
    if (args[1] === 'audit') {
      await validateAudit(markdown, args[2]);
    } else {
      await validateTrace(markdown, args[2]);
    }
  } catch (error) {
    fail([`보고서를 읽을 수 없습니다: ${error.message}`]);
  }
}
