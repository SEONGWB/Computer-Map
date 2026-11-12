/* =========================================================
   흐름 투어 데이터 — 세 갈래
   1) 하드웨어 보드(scope: 'board'): 입력부터 출력까지 장치를 넘나드는 큰 흐름
   2) 부품 화면(scene): 그 장치 안에서 일어나는 흐름
   3) 장치 밖으로 주고받기: 각 부품 설명창의 '밖으로 주고받기' (보드 회로선을 타고 이동)
   단계마다 강조할 장치(ids), 그 순간의 데이터(data), 설명(text)을 가짐.
   ========================================================= */
window.TOURS = [
  {
    id: 'instr', title: '명령어 하나가 실행되기까지', desc: '인출 → 해독 → 실행 → 메모리 → 저장, 그리고 파이프라인',
    steps: [
      { scene: 'cpu', ids: ['reg'], title: '다음 주소 확인', data: { label: '프로그램 카운터 (PC)', value: '0x0040_1A2C', sub: '다음에 실행할 명령어의 주소' },
        text: 'PC 레지스터가 다음에 실행할 명령어가 메모리의 어디에 있는지 가리키고 있어요.' },
      { scene: 'cpu', ids: ['cache'], title: '인출 · FETCH', data: { label: '명령어 (기계어)', value: '0000 0011 0001 0010', sub: 'L1 명령어 캐시에서 가져옴' },
        text: 'PC가 가리키는 주소의 명령어를 L1 캐시에서 가져와요. 캐시에 없으면 L2, L3를 거쳐 메모리까지 내려가야 합니다(캐시 미스).' },
      { scene: 'cpu', ids: ['cu'], title: '해독 · DECODE', data: { label: '해독 결과', value: 'ADD  R1, R2, R3', sub: 'R1 ← R2 + R3' },
        text: '제어 장치가 0과 1로 된 명령어를 해석해요. "R2와 R3를 더해서 R1에 넣어라"라는 뜻이네요. 이제 각 장치에 할 일을 신호로 보냅니다.' },
      { scene: 'cpu', ids: ['reg'], title: '값 읽기', data: { label: '레지스터 값', value: 'R2 = 7 · R3 = 5', sub: '계산에 쓸 두 값' },
        text: '계산에 쓸 두 값을 레지스터에서 꺼내 ALU로 보내요.' },
      { scene: 'cpu', ids: ['alu'], title: '실행 · EXECUTE', data: { label: 'ALU 계산', value: '7 + 5 = 12', sub: '플래그: 0 아님 · 넘침 없음' },
        text: 'ALU가 실제로 덧셈을 해요. 결과가 0인지, 넘쳤는지 같은 상태는 플래그에 기록돼 다음 분기 명령에서 쓰입니다.' },
      { scene: 'cpu', ids: ['cache'], title: '메모리 접근 · MEM', data: { label: '이번 명령은', value: '메모리 접근 없음', sub: 'LOAD · STORE라면 여기서 캐시·RAM을 읽고 씀' },
        text: '덧셈은 메모리를 쓸 일이 없어서 지나가요. 불러오기(LOAD)나 저장(STORE) 명령이었다면 이 단계에서 캐시와 메모리에 접근합니다.' },
      { scene: 'cpu', ids: ['reg'], title: '결과 저장 · WRITE BACK', data: { label: '레지스터', value: 'R1 = 12', sub: 'PC → 0x0040_1A30 (다음 명령어)' },
        text: '결과를 R1에 기록하고, PC는 다음 명령어 주소로 넘어가요. 그리고 다시 인출부터 반복합니다.' },
      { scene: 'cpu', ids: ['clock', 'multicore'], title: '겹쳐서 처리 · 파이프라인', data: { label: '파이프라인', value: '5단계 동시 진행', sub: '한 박자마다 명령어 하나씩 완료' },
        text: '실제 CPU는 한 명령어가 끝날 때까지 기다리지 않아요. 클럭 한 박자마다 앞 명령어는 실행, 뒤 명령어는 해독, 그 뒤는 인출을 하도록 겹쳐서 처리합니다. 공장의 컨베이어 벨트처럼요.' }
    ]
  },
  {
    id: 'render', title: '3D 모델이 화면이 되기까지', desc: '꼭짓점 → 삼각형 → 픽셀 → 화면',
    steps: [
      { scene: 'gpu', ids: ['vram'], title: '모델 데이터', data: { label: '꼭짓점 (정점)', value: 'v0 (1.0, 2.0, 0.5) …', sub: '삼각형 1만 개 · 텍스처 함께' },
        text: '3D 모델은 수많은 꼭짓점과 삼각형으로 되어 있어요. 이 데이터와 텍스처 이미지가 VRAM에 올라와 있습니다.' },
      { scene: 'gpu', ids: ['geometry'], title: '정점 처리', data: { label: '화면 좌표', value: '(640, 360) (812, 402) …', sub: '회전 · 원근 적용' },
        text: '지오메트리 엔진과 코어들이 꼭짓점을 카메라 기준으로 돌리고, 원근을 적용해 화면의 2D 좌표로 바꿔요.' },
      { scene: 'gpu', ids: ['raster'], title: '래스터화', data: { label: '덮는 픽셀', value: '1,284 픽셀', sub: '삼각형 → 픽셀 조각' },
        text: '래스터 엔진이 각 삼각형이 화면의 어느 픽셀을 덮는지 계산해요. 가려서 안 보일 부분은 여기서 미리 버립니다.' },
      { scene: 'gpu', ids: ['cores'], title: '픽셀 칠하기', data: { label: '픽셀 색', value: 'rgb(167, 139, 250)', sub: '빛 계산 + 텍스처 입히기' },
        text: '수천 개의 코어가 픽셀마다 색을 동시에 계산해요. 텍스처 유닛이 그림에서 색을 꺼내 입히고, 빛과 그림자를 더합니다.' },
      { scene: 'gpu', ids: ['rop'], title: '합치기', data: { label: '깊이 비교', value: 'z 0.42 < 0.57 → 통과', sub: '앞에 있는 픽셀만 남김' },
        text: 'ROP가 같은 자리에 겹친 픽셀 중 앞에 있는 것만 남기고, 반투명한 색은 섞어요. 완성된 픽셀은 VRAM의 프레임 버퍼에 씁니다.' },
      { scene: 'gpu', ids: ['display'], title: '화면으로', data: { label: '프레임', value: '1920 × 1080 · 144 Hz', sub: 'HDMI · DisplayPort' },
        text: '디스플레이 엔진이 완성된 프레임을 한 줄씩 읽어 모니터로 보내요. 이 모든 과정이 1초에 수십~수백 번 반복됩니다.' }
    ]
  },
  {
    id: 'matmul', title: 'AI 계산 한 번이 일어나기까지', desc: '가중치 → 워프 → 텐서 코어 → 결과',
    steps: [
      { scene: 'gpu', ids: ['vram'], title: '가중치 불러오기', data: { label: '행렬', value: 'W [4096 × 4096] · FP16', sub: '신경망 한 층의 가중치' },
        text: 'AI 모델의 한 층은 거대한 숫자 표(행렬)예요. 이 가중치와 입력 데이터가 VRAM에 올라와 있습니다.' },
      { scene: 'gpu', ids: ['cores'], title: '일 나누기', data: { label: '타일', value: '16 × 16 조각 6만 개', sub: '워프마다 조각 하나씩' },
        text: '큰 행렬을 작은 조각(타일)으로 나눠 SM과 워프들에게 나눠 줘요. 조각마다 따로 계산할 수 있어서 수천 개가 동시에 움직입니다.' },
      { scene: 'gpu', ids: ['tensor'], title: '행렬 곱', data: { label: '텐서 코어', value: 'D = A × B + C', sub: '한 번에 4×4 행렬 곱' },
        text: '텐서 코어가 작은 행렬 곱셈과 덧셈을 한 번에 처리해요. 일반 코어로 수십 번 할 일을 한 번에 끝냅니다.' },
      { scene: 'gpu', ids: ['vram'], title: '결과 모으기', data: { label: '출력', value: 'Y [1 × 4096]', sub: '다음 층의 입력이 됨' },
        text: '조각들의 결과를 모아 VRAM에 써요. 이 결과가 다음 층의 입력이 되고, 모델의 층 수만큼 이 과정을 반복합니다.' }
    ]
  },
  {
    id: 'web', title: '웹 페이지 요청이 나가기까지', desc: '주소창 입력 → 층마다 포장 → 서버까지',
    steps: [
      { scene: 'network', ids: ['client'], title: '요청 만들기', data: { label: '데이터', value: 'GET /index.html', sub: '브라우저가 만든 HTTP 요청' },
        text: '주소창에 주소를 입력하면 브라우저가 "이 페이지 주세요"라는 HTTP 요청을 만들어요.' },
      { scene: 'network', ids: ['osi7', 'osi6'], title: '응용 · 표현 계층', data: { label: '포장', value: 'TLS[ HTTP ]', sub: 'HTTPS: 내용을 암호화' },
        text: 'HTTP 요청을 TLS로 암호화해요. 중간에서 누가 엿봐도 내용을 알 수 없게요.' },
      { scene: 'network', ids: ['osi4'], title: '전송 계층', data: { label: '포장', value: 'TCP[ TLS[ HTTP ] ]', sub: '포트 443 · 순서 번호' },
        text: 'TCP 헤더가 붙어요. 받는 쪽 프로그램을 알려 주는 포트 번호(443)와, 빠짐없이 순서대로 도착하게 하는 번호가 들어갑니다.' },
      { scene: 'network', ids: ['osi3'], title: '네트워크 계층', data: { label: '포장', value: 'IP[ TCP[ … ] ]', sub: '목적지 203.0.113.7' },
        text: 'IP 헤더가 붙어요. 이제 이 패킷은 목적지 IP 주소를 들고 여러 네트워크를 건너갈 수 있어요.' },
      { scene: 'network', ids: ['osi1', 'osi2'], title: '링크 · 물리 계층', data: { label: '프레임 → 신호', value: 'ETH[ IP[ … ] ] → 0101…', sub: '다음 장비의 MAC 주소' },
        text: '이더넷 헤더가 붙어 프레임이 되고, 마지막으로 전기 신호나 전파로 바뀌어 선을 타고 나가요.' },
      { scene: 'network', ids: ['switch', 'router'], title: '스위치 · 라우터', data: { label: '주소 바꾸기', value: '192.168.0.12 → 공인 IP', sub: 'NAT · 라우팅 테이블' },
        text: '스위치가 공유기 쪽으로 프레임을 넘기고, 라우터는 사설 IP를 공인 IP로 바꾼(NAT) 뒤 인터넷 쪽으로 보낼 길을 골라요.' },
      { scene: 'network', ids: ['internet'], title: '인터넷 건너기', data: { label: '거쳐 가는 곳', value: 'ISP → 백본 → ISP', sub: '라우터 십여 개' },
        text: '패킷이 통신사망과 백본망의 라우터 여러 개를 건너가요. 라우터마다 목적지 IP를 보고 다음 길을 정합니다.' },
      { scene: 'network', ids: ['server'], title: '서버 도착', data: { label: '포장 풀기', value: 'HTTP GET /index.html', sub: '역순으로 헤더를 벗김' },
        text: '서버는 붙은 순서의 반대로 헤더를 하나씩 벗겨 원래 요청을 꺼내요. 그리고 같은 과정을 거꾸로 밟아 웹 페이지를 돌려보냅니다.' }
    ]
  },
  /* ---------- 부품 화면 안의 흐름 (추가) ---------- */
  {
    id: 'fileread', title: '파일 하나를 읽기까지', desc: '경로 → 메타데이터 → 블록 → NAND',
    steps: [
      { scene: 'storage', ids: ['fs'], title: '경로 따라가기', data: { label: '경로', value: '/home/me/note.txt', sub: '디렉터리마다 다음 이름을 찾음' },
        text: '파일 시스템이 루트부터 디렉터리를 하나씩 따라 내려가며 note.txt라는 이름을 찾아요.' },
      { scene: 'storage', ids: ['fs'], title: '메타데이터 읽기', data: { label: 'inode 1532', value: '4 KB · 블록 #88120', sub: '크기 · 권한 · 데이터 위치' },
        text: '이름 옆에 적힌 번호(inode)로 파일 정보를 읽어요. 여기에 실제 내용이 어느 블록에 있는지 적혀 있습니다.' },
      { scene: 'storage', ids: ['interface'], title: '읽기 명령 보내기', data: { label: 'NVMe 명령', value: 'READ LBA 0x0158_3A00', sub: '제출 큐에 넣고 SSD에 알림' },
        text: '운영체제가 NVMe 큐에 "이 블록을 읽어 줘" 명령을 넣고 SSD에 알려요. 큐가 수만 개라 동시에 많이 보낼 수 있어요.' },
      { scene: 'storage', ids: ['ssd'], title: 'NAND에서 꺼내기', data: { label: '플래시 페이지', value: '칩 3 · 블록 210 · 페이지 7', sub: '컨트롤러가 주소를 실제 위치로 변환' },
        text: 'SSD 컨트롤러가 논리 주소를 실제 NAND 칩의 위치로 바꿔(매핑 표) 데이터를 읽어요. 이 데이터가 메모리로 가는 모습은 SSD 설명창의 "밖으로 주고받기"에서 이어집니다.' }
    ]
  },
  {
    id: 'pagefault', title: '페이지 폴트가 일어나면', desc: '메모리에 없는 페이지를 디스크에서 가져오기',
    steps: [
      { scene: 'memory', ids: ['vm'], title: '가상 주소 요청', data: { label: '가상 주소', value: '0x0040_2A10', sub: '페이지 0x402 · 오프셋 0xA10' },
        text: '프로그램이 어떤 주소를 읽으려고 해요. 이 주소는 프로그램만의 가상 주소라서 실제 위치로 바꿔야 합니다.' },
      { scene: 'memory', ids: ['paging'], title: '주소 변환 실패', data: { label: '페이지 테이블', value: '0x402 → 없음 (P=0)', sub: 'TLB 미스 → 표에도 없음' },
        text: 'TLB에도 없고 페이지 테이블을 봐도 "메모리에 없음"이라고 되어 있어요. 페이지 폴트가 발생해 운영체제가 끼어듭니다.' },
      { scene: 'memory', ids: ['disk'], title: '디스크에서 찾기', data: { label: '스왑 위치', value: 'swap 슬롯 #5120', sub: '4 KB 읽기 (아주 느림)' },
        text: '운영체제가 그 페이지가 디스크의 어디에 있는지 찾아 읽어 와요. 메모리보다 수만 배 느려서 이 순간 프로그램은 기다립니다.' },
      { scene: 'memory', ids: ['ram'], title: '빈 프레임에 올리기', data: { label: '물리 프레임', value: '0x402 → 프레임 0x1F7', sub: '페이지 테이블 갱신 (P=1)' },
        text: '빈 프레임에 페이지를 올리고 페이지 테이블에 새 위치를 적어요. 빈 곳이 없으면 오래 안 쓴 페이지를 디스크로 내보냅니다.' },
      { scene: 'memory', ids: ['vm', 'ram'], title: '다시 실행', data: { label: '물리 주소', value: '0x001F_7A10', sub: '이번엔 변환 성공' },
        text: '멈췄던 명령어를 다시 실행하면 이번엔 주소 변환이 성공해 RAM에서 값을 읽어요. 프로그램은 이런 일이 있었는지도 모릅니다.' }
    ]
  },
  {
    id: 'irq', title: '키 입력이 인터럽트가 되기까지', desc: '키보드 → USB 컨트롤러 → 인터럽트',
    steps: [
      { scene: 'chipset', ids: ['io'], title: '키 누름', data: { label: '스캔 코드', value: '0x04 · "A"', sub: 'USB 키보드가 보내는 신호' },
        text: '키를 누르면 키보드 안의 컨트롤러가 어떤 키인지 나타내는 코드를 만들어 USB로 보내요.' },
      { scene: 'chipset', ids: ['pch'], title: '칩셋이 받음', data: { label: 'USB 컨트롤러', value: '입력 보고서 수신', sub: '버퍼에 저장' },
        text: '칩셋 안의 USB 컨트롤러가 이 데이터를 받아 잠시 담아 둬요.' },
      { scene: 'chipset', ids: ['interrupt'], title: '인터럽트 요청', data: { label: '인터럽트', value: 'IRQ · 벡터 0x21', sub: '"처리할 게 생겼어요"' },
        text: '인터럽트 컨트롤러가 우선순위를 정리해 CPU로 전달해요. CPU로 넘어가는 모습은 인터럽트 설명창의 "밖으로 주고받기"에서 이어집니다.' }
    ]
  },
  {
    id: 'dma', title: 'DMA로 데이터 옮기기', desc: 'CPU 대신 장치가 메모리와 직접 주고받기',
    steps: [
      { scene: 'chipset', ids: ['dma'], title: '전송 준비', data: { label: '전송 설정', value: '장치 → 0x8800_0000 · 64 KB', sub: 'CPU가 한 번만 알려 줌' },
        text: 'CPU가 DMA 컨트롤러에게 "어디서, 어디로, 얼마나" 옮길지만 알려 주고 자기 일로 돌아가요.' },
      { scene: 'chipset', ids: ['pch'], title: '직접 전송', data: { label: '전송 중', value: '64 KB / 64 KB', sub: 'CPU는 그동안 다른 일' },
        text: '장치와 메모리가 CPU를 거치지 않고 버스로 바로 데이터를 주고받아요. 랜카드, SSD, GPU가 모두 이렇게 메모리와 일합니다.' },
      { scene: 'chipset', ids: ['interrupt'], title: '완료 알림', data: { label: '인터럽트', value: '전송 완료', sub: 'CPU가 결과만 확인' },
        text: '다 옮기면 인터럽트로 CPU에 끝났다고 알려요. CPU는 시작과 끝만 챙기면 됩니다.' }
    ]
  },

  /* ---------- 하드웨어 보드: 입력부터 출력까지 큰 흐름 ---------- */
  {
    id: 'run', scope: 'board', title: '프로그램 실행부터 화면까지', desc: '저장장치 → 메모리 → CPU → GPU → 모니터',
    steps: [
      { ids: ['storage'], title: '실행 파일 읽기', data: { label: '파일', value: 'game.exe · 85 MB', sub: 'SSD에 저장된 프로그램' },
        text: '아이콘을 더블클릭하면 운영체제가 SSD에서 실행 파일을 찾아 읽기 시작해요.' },
      { ids: ['memory'], title: '메모리에 올리기', data: { label: '메모리', value: '0x7FF6_0000 ~', sub: 'NVMe → RAM (DMA)' },
        text: '프로그램은 메모리에 있어야 실행할 수 있어요. SSD의 데이터가 NVMe 선을 타고 RAM으로 바로 복사됩니다.' },
      { ids: ['cpu'], title: 'CPU가 실행', data: { label: '명령어', value: '초당 수십억 개', sub: 'RAM → 캐시 → 인출 · 해독 · 실행' },
        text: 'CPU가 메모리에서 명령어를 가져와 하나씩 실행해요. 자주 쓰는 것은 캐시에 두고 빠르게 꺼냅니다.' },
      { ids: ['memory'], title: '그릴 내용 준비', data: { label: '그리기 명령', value: '삼각형 1만 개 · 텍스처', sub: 'CPU가 RAM에 써 둠' },
        text: '화면에 무엇을 그릴지 정한 CPU가 모델과 그리기 명령을 메모리에 준비해요.' },
      { ids: ['gpu'], title: 'GPU로 복사', data: { label: 'VRAM', value: 'RAM → VRAM', sub: 'PCIe x16 (DMA)' },
        text: 'GPU가 PCIe 레인으로 그 데이터를 VRAM에 가져와 수천 개의 코어로 동시에 그려요.' },
      { ids: ['monitor'], title: '모니터로', data: { label: '프레임', value: '1920 × 1080 · 144 Hz', sub: '그래픽카드 뒷면 포트 → 모니터' },
        text: '완성된 화면이 HDMI나 DisplayPort로 모니터에 나가요. 이 과정이 1초에 수십~수백 번 반복됩니다. 모니터 케이블은 그래픽카드 뒷면 포트에 바로 꽂혀 있어서 화면 출력은 칩셋을 거치지 않아요(소리·USB 같은 다른 출력은 칩셋을 거쳐요).' }
    ]
  },
  {
    id: 'keyscreen', scope: 'board', title: '키를 눌러 글자가 보이기까지', desc: '키보드 → 칩셋 → CPU → 메모리 → GPU → 모니터',
    steps: [
      { ids: ['input'], title: '키 누르기', data: { label: '스캔 코드', value: '0x04 · "A"', sub: '키보드 안의 작은 칩이 만듦' },
        text: '키를 누르면 키보드 안의 작은 칩이 어떤 키인지 코드(스캔 코드)로 바꿔요.' },
      { ids: ['chipset'], title: 'USB로 들어오기', data: { label: 'USB', value: '0x04 · "A"', sub: 'USB 케이블 → 뒷면 단자 → 칩셋' },
        text: '코드가 USB 케이블을 타고 뒷면 단자로 들어가, 보드 위 선을 따라 칩셋에 도착해요.' },
      { ids: ['cpu'], title: '인터럽트', data: { label: '인터럽트', value: 'IRQ → 처리 루틴', sub: '하던 일을 잠시 멈춤' },
        text: '칩셋이 CPU에 인터럽트를 보내요. CPU는 하던 일을 잠시 멈추고 키 입력을 처리합니다.' },
      { ids: ['memory'], title: '글자 저장', data: { label: '입력 버퍼', value: '"A" → 메모장 버퍼', sub: '운영체제 → 프로그램' },
        text: '운영체제가 키 값을 지금 쓰는 프로그램(메모장)에 넘기고, 프로그램은 글자를 메모리의 문서 내용에 추가해요.' },
      { ids: ['gpu'], title: '글자 그리기', data: { label: '그리기', value: '"A" 글리프 · 16 px', sub: 'RAM → VRAM' },
        text: '화면을 다시 그려야 하니 GPU가 바뀐 부분을 받아 글자 모양을 픽셀로 칠해요.' },
      { ids: ['monitor'], title: '화면에 표시', data: { label: '지연 시간', value: '약 10~30 ms', sub: '다음 화면 갱신 때 보임' },
        text: '다음 화면 갱신 때 모니터에 "A"가 나타나요. 키를 누르고 눈으로 보기까지 보통 수십 ms 안에 이 모든 일이 일어납니다. 모니터 케이블은 그래픽카드 뒷면 포트에 바로 꽂혀 있어서 화면 출력은 칩셋을 거치지 않아요(소리·USB 같은 다른 출력은 칩셋을 거쳐요).' }
    ]
  },
  {
    id: 'webscreen', scope: 'board', title: '웹 페이지가 화면에 뜨기까지', desc: '랜카드 → 메모리 → CPU → GPU → 모니터',
    steps: [
      { ids: ['network'], title: '패킷 도착', data: { label: '패킷', value: 'HTTP 200 OK · HTML', sub: '서버가 보낸 응답' },
        text: '서버가 보낸 웹 페이지가 패킷으로 나뉘어 랜카드(또는 Wi-Fi)로 들어와요.' },
      { ids: ['memory'], title: '메모리에 쓰기', data: { label: '수신 버퍼', value: 'DMA → RAM', sub: 'CPU 코어는 일하지 않음' },
        text: '랜카드가 받은 패킷을 RAM에 바로 써요(DMA). 다 쓰면 칩셋을 통해 인터럽트로 CPU에 알립니다.' },
      { ids: ['cpu'], title: '해석하고 계산', data: { label: '브라우저', value: 'HTML · CSS · JS', sub: '모양과 위치 계산' },
        text: 'CPU가 운영체제의 네트워크 처리를 거쳐 브라우저에 데이터를 넘기고, 브라우저는 HTML을 해석해 무엇을 어디에 그릴지 계산해요.' },
      { ids: ['memory'], title: '그릴 준비', data: { label: '레이어', value: '텍스트 · 이미지 · 박스', sub: '그리기 명령 목록' },
        text: '계산한 결과를 그리기 명령으로 만들어 메모리에 준비해요.' },
      { ids: ['gpu'], title: '화면에 그리기', data: { label: '프레임', value: '페이지 표시', sub: 'RAM → VRAM → 모니터' },
        text: 'GPU가 이를 받아 픽셀로 칠해요.' },
      { ids: ['monitor'], title: '화면에 표시', data: { label: '출력', value: 'HDMI · DP → 모니터', sub: '칩셋은 거치지 않음' },
        text: '완성된 화면은 그래픽카드 뒷면 단자에서 케이블을 타고 모니터로 바로 나가요. 칩셋은 거치지 않아요.' }
    ]
  },
  /* ---------- 소프트웨어 보드: 앱에서 하드웨어까지 ---------- */
  {
    id: 'sw-save', title: '저장 버튼을 눌렀을 때', desc: '앱 → 언어·실행 → 운영체제 → 디스크 → 다시 앱',
    steps: [
      { scene: 'software', ids: ['app'], title: '버튼 클릭', data: { label: '이벤트', value: "onClick('저장')", sub: '사용자의 클릭이 앱 코드로' },
        text: '저장 버튼을 누르면 앱의 UI가 클릭 이벤트를 받아, 문서 내용을 파일로 쓰라는 코드를 실행해요.' },
      { scene: 'software', ids: ['runtime'], title: '라이브러리 호출', data: { label: '함수 호출', value: "fs.writeFile('note.txt')", sub: '언어의 표준 라이브러리' },
        text: '앱 코드는 직접 디스크를 다루지 않아요. 언어가 제공하는 파일 라이브러리를 부르면, 라이브러리가 운영체제에 부탁할 준비를 합니다.' },
      { scene: 'software', ids: ['os'], title: '시스템 콜', data: { label: '시스템 콜', value: 'write(fd=3, buf, 2048)', sub: '사용자 모드 → 커널 모드' },
        text: '라이브러리가 시스템 콜로 운영체제를 불러요. CPU가 커널 모드로 바뀌고, 운영체제의 파일 시스템이 어느 블록에 쓸지 정해 우선 메모리(페이지 캐시)에 담아 둡니다.' },
      { scene: 'software', ids: ['os'], title: '디스크에 기록', data: { label: '블록 쓰기', value: '블록 #88120 ← 2 KB', sub: '드라이버 → SSD' },
        text: '운영체제가 드라이버를 통해 SSD에 실제로 기록해요. 저널에 먼저 적어 두기 때문에 정전이 나도 파일이 깨지지 않습니다.' },
      { scene: 'software', ids: ['app'], title: '저장 완료', data: { label: '결과', value: '0 (성공) → "저장됨"', sub: '커널 → 라이브러리 → 앱' },
        text: '성공했다는 결과가 거꾸로 올라와 앱에 도착하고, 화면에 "저장됨"이 표시돼요.' }
    ]
  },
  {
    id: 'sw-web', title: '웹 요청이 서버 코드에 닿기까지', desc: '운영체제 → 언어·실행 → 앱 → 다시 운영체제',
    steps: [
      { scene: 'software', ids: ['os'], title: '요청 도착', data: { label: 'HTTP 요청', value: 'GET /orders/42', sub: 'TCP 연결로 들어온 바이트' },
        text: '클라이언트가 보낸 HTTP 요청이 네트워크를 타고 서버의 랜카드에 도착해요.' },
      { scene: 'software', ids: ['os'], title: '소켓에 담김', data: { label: '소켓', value: 'socket :443 · 수신 버퍼', sub: '커널의 TCP/IP 처리' },
        text: '운영체제가 TCP/IP를 처리해 이 데이터를 서버 프로그램의 소켓 수신 버퍼에 담고, 프로그램을 깨워요.' },
      { scene: 'software', ids: ['runtime'], title: '요청 해석', data: { label: '프레임워크', value: 'Request{ path: /orders/42 }', sub: '바이트 → 객체' },
        text: '런타임 위에서 도는 웹 프레임워크가 바이트를 읽어 요청 객체로 바꾸고, 주소에 맞는 코드(라우트)를 찾아요.' },
      { scene: 'software', ids: ['app'], title: '서버 코드 실행', data: { label: '컨트롤러', value: 'getOrder(42)', sub: '우리가 작성한 코드' },
        text: '드디어 우리가 작성한 서버 코드가 실행돼요. 주문 정보를 가져오려면 데이터베이스에 물어봐야 해요.' },
      { scene: 'software', ids: ['os'], title: '데이터베이스 조회', data: { label: 'SQL', value: 'SELECT * FROM orders WHERE id=42', sub: '인덱스로 바로 찾기' },
        text: '데이터베이스가 인덱스로 해당 행을 찾아 돌려줘요.' },
      { scene: 'software', ids: ['os'], title: '응답 보내기', data: { label: 'HTTP 응답', value: '200 OK · {"id":42,…}', sub: 'JSON → 소켓 → 네트워크' },
        text: '결과를 JSON으로 만들어 응답을 보내요. 같은 층들을 거꾸로 지나 클라이언트에게 돌아갑니다.' }
    ]
  },
  {
    id: 'sw-launch', title: '앱 아이콘을 눌러 화면이 뜨기까지', desc: '운영체제 → 런타임 → 앱 → 다시 운영체제',
    steps: [
      { scene: 'software', ids: ['os'], title: '프로세스 만들기', data: { label: '프로세스', value: 'PID 4821 · exec("app")', sub: '실행 파일을 메모리에' },
        text: '아이콘을 누르면 운영체제가 새 프로세스를 만들고, 실행 파일을 메모리에 올려 시작 주소로 점프해요.' },
      { scene: 'software', ids: ['runtime'], title: '런타임 시작', data: { label: '런타임', value: 'VM 시작 · 코드 로드', sub: '필요하면 JIT 컴파일' },
        text: '자바나 자바스크립트 앱이라면 런타임(가상 머신)이 먼저 켜져 코드를 불러오고, 자주 쓰는 코드는 기계어로 바꿔 둬요.' },
      { scene: 'software', ids: ['app'], title: '화면 구성', data: { label: 'UI', value: '창 · 버튼 · 텍스트', sub: '그릴 목록 만들기' },
        text: '앱이 첫 화면에 무엇을 어디에 그릴지 계산해 그리기 명령 목록을 만들어요.' },
      { scene: 'software', ids: ['os'], title: '화면에 그리기', data: { label: '그래픽', value: '드라이버 → GPU', sub: '창 관리자가 합성' },
        text: '운영체제의 창 관리자와 그래픽 드라이버가 그리기 명령을 GPU에 넘겨 화면에 앱 창이 나타나요. 하드웨어 쪽 과정은 하드웨어 보드의 흐름에서 이어 볼 수 있어요.' }
    ]
  },
  /* ---------- 운영체제 화면 안의 흐름 ---------- */
  {
    id: 'os-read', title: '시스템 콜 한 번', desc: 'read() 한 줄이 커널과 디스크를 다녀오기까지',
    steps: [
      { scene: 'os', ids: ['process'], title: '읽기 요청', data: { label: '호출', value: 'read(fd=3, buf, 4096)', sub: '사용자 모드의 프로그램' },
        text: '프로그램이 파일을 읽으려고 read()를 불러요. 프로그램은 디스크를 직접 만질 권한이 없어서 운영체제에 부탁해야 합니다.' },
      { scene: 'os', ids: ['syscall'], title: '커널로 들어가기', data: { label: '모드 전환', value: 'USER → KERNEL', sub: 'syscall 명령 · 시스템 콜 번호 0' },
        text: 'syscall 명령으로 CPU가 커널 모드로 바뀌고, 시스템 콜 표에서 read를 처리할 커널 함수로 점프해요.' },
      { scene: 'os', ids: ['fs'], title: '캐시 확인', data: { label: '페이지 캐시', value: 'note.txt · 0~4KB → 없음', sub: '메모리에 없으면 디스크로' },
        text: '파일 시스템이 먼저 페이지 캐시를 봐요. 최근에 읽은 적이 있으면 여기서 바로 끝나지만, 이번엔 없어서 디스크에서 가져와야 해요.' },
      { scene: 'os', ids: ['driver'], title: '디스크에 요청', data: { label: '드라이버', value: 'NVMe READ LBA 0x3A00', sub: '프로세스는 대기 상태로' },
        text: '드라이버가 SSD에 읽기 명령을 보내요. 기다리는 동안 이 프로세스는 대기 상태가 되고, CPU는 다른 프로세스를 돌립니다.' },
      { scene: 'os', ids: ['driver'], title: '완료 인터럽트', data: { label: '인터럽트', value: 'IRQ · NVMe 완료', sub: 'DMA로 이미 메모리에 도착' },
        text: 'SSD가 DMA로 데이터를 메모리에 다 옮기고 인터럽트를 보내요. 커널이 이를 받아 기다리던 프로세스를 다시 준비 상태로 바꿔요.' },
      { scene: 'os', ids: ['fs'], title: '캐시에 담기', data: { label: '페이지 캐시', value: 'note.txt · 0~4KB 저장', sub: '다음엔 디스크에 안 가도 됨' },
        text: '읽은 내용을 페이지 캐시에 넣어 둬요. 같은 파일을 또 읽으면 이번엔 메모리에서 바로 꺼냅니다.' },
      { scene: 'os', ids: ['process'], title: '결과 돌려주기', data: { label: '반환값', value: '4096 (읽은 바이트 수)', sub: 'KERNEL → USER' },
        text: '데이터를 프로그램의 버퍼에 복사하고 사용자 모드로 돌아가요. 프로그램 입장에선 read() 한 줄이 끝났을 뿐이에요.' }
    ]
  },
  {
    id: 'os-switch', title: '컨텍스트 스위치', desc: 'CPU 하나로 여러 프로그램이 동시에 도는 비밀',
    steps: [
      { scene: 'os', ids: ['process'], title: 'P1 실행 중', data: { label: '실행 중', value: 'P1 · PC=0x4010', sub: '타임 슬라이스 4ms' },
        text: 'P1이 CPU를 쓰고 있어요. 하지만 혼자 계속 쓸 수는 없어요. 정해진 시간(타임 슬라이스)이 있어요.' },
      { scene: 'os', ids: ['driver'], title: '타이머 인터럽트', data: { label: '인터럽트', value: 'TIMER · 4ms 경과', sub: '하던 일을 멈추고 커널로' },
        text: '타이머가 인터럽트를 보내면 CPU는 P1을 멈추고 커널의 처리 코드로 들어가요.' },
      { scene: 'os', ids: ['scheduler'], title: 'P1 저장', data: { label: 'PCB 저장', value: 'P1 { PC, SP, R0~R15 }', sub: '나중에 그대로 이어 하려고' },
        text: '스케줄러가 P1의 레지스터 값을 P1의 PCB에 저장하고, P1을 준비 큐 맨 뒤로 보내요.' },
      { scene: 'os', ids: ['scheduler'], title: '다음 차례 고르기', data: { label: '준비 큐', value: '[P2, P3, P1] → P2', sub: 'CFS: 가장 덜 쓴 프로세스' },
        text: '준비 큐에서 다음 차례를 골라요. 리눅스의 CFS는 지금까지 CPU를 가장 적게 쓴 프로세스를 고릅니다.' },
      { scene: 'os', ids: ['process'], title: 'P2 이어서 실행', data: { label: '실행 중', value: 'P2 · PC=0x7A20', sub: '저장해 둔 값 복원' },
        text: 'P2의 PCB에서 레지스터 값을 되살려 멈췄던 곳부터 이어서 실행해요. 이 교대가 1초에 수백 번 일어나 모두 동시에 도는 것처럼 보여요.' }
    ]
  },
  {
    id: 'os-fork', title: '프로세스가 만들어지기까지', desc: 'fork()와 exec()로 새 프로그램 시작',
    steps: [
      { scene: 'os', ids: ['process'], title: '복제 요청', data: { label: '호출', value: 'fork()', sub: '셸이 새 프로그램을 띄울 때' },
        text: '셸에서 명령을 입력하면, 셸은 먼저 fork()로 자기 자신을 복제해 달라고 요청해요.' },
      { scene: 'os', ids: ['syscall'], title: '커널로', data: { label: '모드 전환', value: 'USER → KERNEL', sub: 'fork 처리 함수로' },
        text: '시스템 콜을 통해 커널로 들어가요.' },
      { scene: 'os', ids: ['mm'], title: '주소 공간 복사', data: { label: '페이지 테이블', value: '부모 → 자식 (Copy-on-Write)', sub: '실제 복사는 쓸 때만' },
        text: '자식 프로세스용 페이지 테이블을 만들어요. 메모리를 통째로 복사하지 않고, 둘 중 하나가 고칠 때만 복사(Copy-on-Write)해서 빠릅니다.' },
      { scene: 'os', ids: ['scheduler'], title: '준비 큐에 넣기', data: { label: '새 PCB', value: 'PID 4821 · 준비', sub: '스케줄러가 차례를 줌' },
        text: '새 PCB를 만들어 준비 큐에 넣어요. 이제 자식도 CPU 차례를 받을 수 있어요.' },
      { scene: 'os', ids: ['process'], title: '새 프로그램으로', data: { label: '호출', value: 'exec("/usr/bin/ls")', sub: '내용을 새 프로그램으로 교체' },
        text: '자식은 exec()로 자기 내용을 실행할 프로그램으로 바꿔요. 이렇게 새 프로세스가 태어납니다.' }
    ]
  },
  /* ---------- 소프트웨어 영역 화면 안의 흐름 ---------- */
  {
    id: 'rt-run', title: '코드가 실행되기까지', desc: '소스 코드 한 줄이 번역되고 실행되어 치워지기까지',
    steps: [
      { scene: 'runtime', ids: ['source'], title: '코드 작성', data: { label: '소스', value: 'total = price * 3', sub: '사람이 읽는 글자' }, text: '사람이 쓴 코드는 그냥 글자예요. CPU는 이걸 그대로 읽지 못해요.' },
      { scene: 'runtime', ids: ['compiler'], title: '번역', data: { label: 'AST', value: '= (total, * (price, 3))', sub: '토큰 → 트리' }, text: '컴파일러가 글자를 토큰으로 자르고, 문법에 맞춰 트리(AST)로 엮은 뒤 번역해요.' },
      { scene: 'runtime', ids: ['bytecode'], title: '바이트코드', data: { label: '명령어', value: 'LOAD price · PUSH 3 · MUL · STORE total', sub: '단순한 명령의 나열' }, text: '결과는 아주 단순한 명령어 목록이에요. 자바 · 파이썬은 바이트코드, C는 바로 기계어가 나와요.' },
      { scene: 'runtime', ids: ['code'], title: '메모리에 올리기', data: { label: '로드', value: 'Main.class → 메서드 영역', sub: '디스크 → 내 앱의 메모리' }, text: '번역 결과를 디스크에서 읽어 내 앱의 메모리(코드 영역)에 올려요. 이제부터 실행이 끝날 때까지 여기서 명령을 하나씩 꺼내 가요.' },
      { scene: 'runtime', ids: ['vm'], title: '실행', data: { label: 'VM', value: 'MUL 실행 · 반복 1만 번 → JIT', sub: '자주 돌면 기계어로' }, text: '가상 머신이 코드 영역에서 명령어를 하나씩 꺼내 실행해요. 같은 코드가 수천 번 돌면 JIT이 그 부분을 기계어로 바꿔 빠르게 해요.' },
      { scene: 'runtime', ids: ['memory'], title: '메모리에 담기', data: { label: '스택 · 힙', value: 'total = 30000 (스택)', sub: '객체는 힙에' }, text: '계산한 값은 지역 변수라 스택에, new로 만든 객체는 힙에 담겨요.' },
      { scene: 'runtime', ids: ['gc'], title: '치우기', data: { label: 'GC', value: '안 쓰는 객체 3개 회수', sub: '마크 → 스윕' }, text: '함수가 끝나고 아무도 가리키지 않는 객체는 가비지 컬렉터가 치워서 힙 공간을 돌려받아요.' }
    ]
  },
  {
    id: 'app-save', title: '저장 버튼을 눌렀을 때', desc: '클릭 → 이벤트 루프 → 내 코드 → 작업 스레드 → 파일 쓰기 → 저장됨',
    steps: [
      { scene: 'app', ids: ['ui'], title: '저장 클릭', data: { label: '이벤트', value: "click → '저장'", sub: '마우스 → 운영체제 → 앱' }, text: '사용자가 저장 버튼을 눌러요. 운영체제가 받은 마우스 신호가 앱의 클릭 이벤트로 바뀌어 도착해요.' },
      { scene: 'app', ids: ['loop'], title: '이벤트 꺼내기', data: { label: '이벤트 큐', value: '[click] → onSave()', sub: 'UI 스레드' }, text: 'UI 스레드의 이벤트 루프가 큐에서 클릭을 꺼내, 미리 연결해 둔 내 함수를 불러요.' },
      { scene: 'app', ids: ['handler'], title: '내 코드 실행', data: { label: '내 코드', value: 'text = editor.getText()', sub: 'UI 스레드에서 실행' }, text: '이제부터는 내가 짠 코드가 실행돼요. 먼저 편집창의 글자를 꺼내요.' },
      { scene: 'app', ids: ['state'], title: '상태 바꾸기', data: { label: '상태', value: 'status = "저장 중…"', sub: '화면이 이 값을 따라 바뀜' }, text: '상태 값을 바꾸면 화면이 그 값을 따라 "저장 중…"으로 바뀌어요.' },
      { scene: 'app', ids: ['handler'], title: '작업 스레드 부탁', data: { label: '스레드', value: 'new Thread(…).start()', sub: '저장은 다른 스레드에게' }, text: '저장은 오래 걸릴 수 있어서 UI 스레드가 직접 하면 화면이 멈춰요. 그래서 작업 스레드를 만들어 달라고 부탁해요. 스레드를 실제로 만드는 건 언어 · 실행과 운영체제예요.' },
      { scene: 'app', ids: ['io'], title: '파일 쓰기 부탁', data: { label: '라이브러리', value: 'Files.writeString(path, text)', sub: '→ 언어 · 실행 → write() 시스템 콜' }, text: '작업 스레드가 파일 쓰기를 부탁해요. 이 부탁은 아래 층으로 내려가 결국 write() 시스템 콜이 돼요.' },
      { scene: 'app', ids: ['ui'], title: '저장됨 표시', data: { label: '상태', value: 'status = "저장됨"', sub: '작업 스레드 → UI 스레드' }, text: '화면은 UI 스레드만 바꿀 수 있어요. 그래서 작업 스레드는 "저장됨으로 바꿔 줘"를 UI 스레드에 다시 맡기고, 화면이 바뀌어요.' }
    ]
  },
  {
    id: 'net-https', title: 'https 주소로 접속하기', desc: 'DNS → 소켓 → TCP → TLS → HTTP → IP',
    steps: [
      { scene: 'net', ids: ['dns'], title: '주소 찾기', data: { label: 'DNS', value: 'shop.com → 93.184.216.34', sub: '이름 → IP 주소' }, text: '먼저 이름을 IP 주소로 바꿔야 해요. 캐시에 없으면 DNS 서버들에게 차례로 물어봐요.' },
      { scene: 'net', ids: ['socket'], title: '손잡이 받기', data: { label: '소켓', value: 'socket() → fd 5', sub: '운영체제가 준 연결 손잡이' }, text: '프로그램이 운영체제에게 소켓을 하나 받아요. 이제 이 손잡이로 네트워크를 써요.' },
      { scene: 'net', ids: ['tcp'], title: '연결 맺기', data: { label: 'TCP', value: 'SYN → SYN-ACK → ACK', sub: '포트 443' }, text: '세 번 신호를 주고받아 연결을 맺어요. 이제부터는 빠짐없이, 순서대로 전달돼요.' },
      { scene: 'net', ids: ['tls'], title: '암호화 합의', data: { label: 'TLS', value: '인증서 확인 · 키 합의', sub: '이후 모든 내용 잠금' }, text: '서버 인증서로 진짜 shop.com인지 확인하고, 둘만 아는 키를 만들어요.' },
      { scene: 'net', ids: ['http'], title: '요청 보내기', data: { label: 'HTTP', value: 'GET / HTTP/1.1', sub: 'Host: shop.com' }, text: '드디어 "첫 페이지를 주세요"라는 HTTP 요청을 보내요.' },
      { scene: 'net', ids: ['ip'], title: '패킷으로', data: { label: 'IP', value: '패킷 3개 → 93.184.216.34', sub: '라우터를 거쳐서' }, text: '요청은 IP 패킷으로 쪼개져 라우터들을 거쳐 서버로 가요. 응답은 이 순서를 거꾸로 올라와요.' }
    ]
  },
  {
    id: 'db-select', title: 'SELECT 한 번', desc: '질의가 인덱스를 타고 데이터를 찾아오기까지',
    steps: [
      { scene: 'data', ids: ['sql'], title: '질의', data: { label: 'SQL', value: 'SELECT * FROM orders WHERE id = 42', sub: '무엇을 원하는지만' }, text: 'SQL은 "어떻게"가 아니라 "무엇을" 원하는지만 말해요.' },
      { scene: 'data', ids: ['planner'], title: '계획 세우기', data: { label: '실행 계획', value: 'Index Scan on orders_pkey', sub: '풀 스캔보다 싸다고 판단' }, text: '옵티마이저가 전부 훑을지, 인덱스로 찾을지 비용을 따져 가장 싼 방법을 골라요.' },
      { scene: 'data', ids: ['index'], title: '인덱스 타기', data: { label: 'B+트리', value: '뿌리 → 가지 → 잎 (3번)', sub: '페이지 #1207, 슬롯 4' }, text: '백만 행이어도 나무를 서너 번만 내려가면 42번 행의 위치를 알아요.' },
      { scene: 'data', ids: ['buffer'], title: '메모리 확인', data: { label: '버퍼 풀', value: '페이지 #1207 → 미스', sub: '없으면 디스크로' }, text: '그 페이지가 버퍼 풀에 있으면 바로 끝. 이번엔 없어서 디스크에서 읽어 와야 해요.' },
      { scene: 'data', ids: ['files'], title: '디스크 읽기', data: { label: '파일', value: 'orders.ibd · 16KB 읽기', sub: '운영체제 → SSD' }, text: '데이터 파일에서 페이지를 읽어 버퍼 풀에 올려 둬요. 다음엔 디스크까지 안 가요.' },
      { scene: 'data', ids: ['sql'], title: '결과', data: { label: '결과', value: '1 row (0.4 ms)', sub: '행과 열로' }, text: '찾은 행을 표 모양으로 돌려줘요.' }
    ]
  },
  {
    id: 'db-commit', title: '커밋이 보장되는 법', desc: '정전이 나도 저장된 주문이 사라지지 않는 이유',
    steps: [
      { scene: 'data', ids: ['sql'], title: '변경', data: { label: 'SQL', value: "UPDATE stock SET qty = qty - 2", sub: 'BEGIN … COMMIT' }, text: '재고를 줄이는 변경을 트랜잭션 안에서 실행해요.' },
      { scene: 'data', ids: ['wal'], title: '먼저 기록', data: { label: 'WAL', value: 'LSN 8812: stock#7 qty 10→8', sub: '로그 끝에 덧붙임' }, text: '실제 데이터를 바꾸기 전에 "무엇을 바꿀지"를 로그에 먼저 적어요.' },
      { scene: 'data', ids: ['buffer'], title: '메모리에서 수정', data: { label: '버퍼 풀', value: '페이지 #88 → 더티', sub: '디스크엔 아직' }, text: '데이터는 메모리의 페이지에서만 바꿔 둬요. 디스크에 바로 쓰면 느리니까요.' },
      { scene: 'data', ids: ['wal'], title: '커밋', data: { label: 'fsync', value: '로그 디스크 기록 완료 → COMMIT OK', sub: '이 순간부터 보장' }, text: '로그가 디스크에 확실히 써지는 순간 커밋 완료예요. 지금 정전이 나도 로그로 되살릴 수 있어요.' },
      { scene: 'data', ids: ['files'], title: '나중에 반영', data: { label: '체크포인트', value: '더티 페이지 모아 쓰기', sub: '천천히, 한꺼번에' }, text: '바뀐 페이지들은 나중에 모아서 데이터 파일에 써요.' }
    ]
  },
  {
    id: 'algo-find', title: '값 하나 찾기', desc: '같은 일, 구조에 따라 걸리는 시간이 다르다',
    steps: [
      { scene: 'algo', ids: ['array'], title: '처음부터 훑기', data: { label: '순차 탐색', value: '100만 개 → 최대 100만 번', sub: 'O(n)' }, text: '정렬 안 된 배열에서 찾으려면 앞에서부터 하나씩 봐야 해요.' },
      { scene: 'algo', ids: ['array'], title: '반씩 자르기', data: { label: '이진 탐색', value: '100만 개 → 20번', sub: 'O(log n) · 정렬돼 있을 때' }, text: '정렬돼 있으면 가운데를 보고 절반을 버리는 걸 반복해요. 20번이면 끝나요.' },
      { scene: 'algo', ids: ['tree'], title: '나무 타고 내려가기', data: { label: '이진 탐색 트리', value: '8 → 5 → 7', sub: 'O(log n) · 넣고 빼기도 빠름' }, text: '트리는 이진 탐색처럼 빠르면서, 값을 넣고 빼기도 쉬워요. 데이터베이스 인덱스가 이 원리예요.' },
      { scene: 'algo', ids: ['hash'], title: '바로 가기', data: { label: '해시', value: 'hash("apple") → 7번 칸', sub: 'O(1) · 평균' }, text: '해시 테이블은 키를 계산해 칸 번호로 바로 가요. 순서는 잃지만 가장 빨라요.' }
    ]
  },
  {
    id: 'algo-bfs', title: '가장 가까운 길 찾기', desc: '그래프와 큐로 너비 우선 탐색',
    steps: [
      { scene: 'algo', ids: ['graph'], title: '지도', data: { label: '그래프', value: '역 6개 · 연결 9개', sub: '노드와 간선' }, text: '지하철 노선도처럼 역(노드)과 연결(간선)로 문제를 바꿔요.' },
      { scene: 'algo', ids: ['stackq'], title: '줄 세우기', data: { label: '큐', value: '[출발역]', sub: '먼저 넣은 것부터' }, text: '출발역을 큐에 넣고, 하나씩 꺼내며 이웃한 역들을 큐 뒤에 넣어요.' },
      { scene: 'algo', ids: ['graph'], title: '넓게 퍼지기', data: { label: 'BFS', value: '1정거장 → 2정거장 → …', sub: '가까운 곳부터' }, text: '가까운 역부터 차례로 퍼져 나가서, 도착역을 처음 만났을 때가 가장 적게 갈아타는 길이에요.' }
    ]
  },
  {
    id: 'sec-login', title: '로그인부터 데이터까지', desc: '요청 하나가 지나는 보안 관문들',
    steps: [
      { scene: 'security', ids: ['tls'], title: '길 잠그기', data: { label: 'TLS', value: 'https://shop.com 🔒', sub: '오가는 내용 암호화' }, text: '먼저 길을 잠가요. 카페 와이파이에서 누가 엿봐도 내용을 읽을 수 없어요.' },
      { scene: 'security', ids: ['auth'], title: '신원 확인', data: { label: '인증', value: 'bcrypt(비밀번호) = 저장된 해시?', sub: '맞으면 출입증 발급' }, text: '비밀번호를 해시해서 저장된 값과 비교해요. 맞으면 이후 요청에 쓸 출입증(세션 · 토큰)을 줘요.' },
      { scene: 'security', ids: ['authz'], title: '권한 확인', data: { label: '인가', value: '주문 #42의 주인 = 나? ✔', sub: '아니면 403' }, text: '로그인했다고 다 되는 건 아니에요. 이 주문이 정말 내 것인지 확인해요.' },
      { scene: 'security', ids: ['sandbox'], title: '갇힌 채로 실행', data: { label: '격리', value: '앱 프로세스 · 최소 권한', sub: 'DB 계정도 필요한 표만' }, text: '앱은 꼭 필요한 권한만 가진 채 칸막이 안에서 돌아요. 뚫려도 피해가 번지지 않게요.' },
      { scene: 'security', ids: ['crypto'], title: '금고에서 꺼내기', data: { label: '저장 암호화', value: 'AES-256 해독 → 주문 정보', sub: '키는 따로 보관' }, text: '디스크의 데이터는 잠겨 있어서, 키를 가진 앱만 풀어 읽을 수 있어요.' }
    ]
  },
  {
    id: 'sec-sqli', title: 'SQL 인젝션 막기', desc: '입력값에 섞인 코드는 어떻게 걸러지나',
    steps: [
      { scene: 'security', ids: ['vuln'], title: '수상한 입력', data: { label: '입력', value: "id = 1' OR '1'='1", sub: '모든 행을 꺼내려는 시도' }, text: '공격자가 입력칸에 SQL 조각을 넣어요. 그대로 문장에 붙이면 모든 주문이 새어 나가요.' },
      { scene: 'security', ids: ['authz'], title: '권한으로 한 번 더', data: { label: '인가', value: '내 주문만 조회 가능', sub: 'WHERE owner = 나' }, text: '조회 자체를 "내 것만"으로 묶어 두면 뚫려도 남의 데이터는 나오지 않아요.' },
      { scene: 'security', ids: ['sandbox'], title: '값으로만 취급', data: { label: '바인딩', value: 'WHERE id = ?  ← "1\' OR…"', sub: '코드가 아니라 글자' }, text: '파라미터 바인딩을 쓰면 입력은 그저 글자로 취급돼요. 코드로 실행될 틈이 없어요.' }
    ]
  },
  {
    id: 'eng-release', title: '기능 하나가 출시되기까지', desc: '설계 → Git → 테스트 → CI/CD → 배포 → 운영 → 다시 설계',
    steps: [
      { scene: 'eng', ids: ['design'], title: '설계', data: { label: '요구사항', value: '"장바구니 쿠폰 적용"', sub: '어디를 고칠지 정하기' }, text: '무엇을 만들지 정하고, 어느 모듈을 어떻게 고칠지 그려 봐요.' },
      { scene: 'eng', ids: ['vcs'], title: '브랜치에서 작업', data: { label: 'Git', value: 'feature/coupon · 커밋 5개', sub: '본 줄기와 따로' }, text: '내 가지에서 작업하고 변경마다 커밋해요. 다 되면 PR을 열어 동료에게 리뷰를 받아요.' },
      { scene: 'eng', ids: ['test'], title: '테스트', data: { label: '테스트', value: '단위 128 · 통합 12 통과', sub: '기존 기능도 확인' }, text: '새 기능이 맞게 도는지, 기존 기능이 망가지지 않았는지 자동으로 확인해요.' },
      { scene: 'eng', ids: ['ci'], title: '자동 파이프라인', data: { label: 'CI', value: 'build ✔ test ✔ image ✔', sub: '합칠 때마다 자동으로' }, text: '본 줄기에 합쳐지면 CI가 빌드 · 테스트 · 이미지 만들기를 자동으로 돌려요.' },
      { scene: 'eng', ids: ['deploy'], title: '조금씩 배포', data: { label: '카나리', value: '5% → 50% → 100%', sub: '문제면 바로 롤백' }, text: '일부 사용자에게 먼저 내보내 이상이 없으면 점점 넓혀요.' },
      { scene: 'eng', ids: ['monitor'], title: '지켜보기', data: { label: '지표', value: '오류율 0.02% · 응답 120ms', sub: '평소와 비교' }, text: '오류와 응답 시간을 지켜보며 문제가 없는지 확인해요.' },
      { scene: 'eng', ids: ['design'], title: '다시 설계로', data: { label: '회고', value: '"쿠폰 중복 적용 문의 3건"', sub: '다음 개선 거리' }, text: '운영에서 얻은 교훈이 다음 설계의 재료가 돼요. 이 순환이 소프트웨어 공학이에요.' }
    ]
  }
];
