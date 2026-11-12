/* =========================================================
   흐름의 언어별 내용 (C · Java · Python)
   tours.js의 흐름 위에 덧입힘: 값이 { c, java, python }이면 지금 언어 것을 보여 줌
   언어가 달라지는 곳은 주로 '언어 · 실행' 단계. 시스템 콜부터는 세 언어가 같아요.
   ========================================================= */
(() => {
  const L = (c, java, python) => ({ c, java, python });
  const PATCH = {
    'sw-save': {
      0: { data: { value: L('on_save_clicked(button)', 'saveButton.addActionListener(e -> save())', 'save_btn.clicked.connect(save)') } },
      1: {
        data: { value: L('fprintf(fp, "%s", text)', 'writer.write(text)', 'f.write(text)'),
          sub: L('C 표준 라이브러리 (libc)', 'java.io → JVM의 네이티브 코드', 'io 모듈 → CPython 내부의 C 코드') },
        text: L('C에서는 fprintf가 libc의 버퍼에 글자를 모았다가, 가득 차거나 fclose할 때 운영체제에 넘겨요. 중간에 가상 머신 같은 단계가 없어요.',
          'Java의 Writer는 JVM 위에서 돌아요. 실제로 디스크에 쓰는 순간에는 JVM 안의 네이티브(C) 코드로 내려가 운영체제를 불러요.',
          'Python의 f.write는 io 모듈이 처리하는데, 이 모듈의 속은 C로 쓰여 있어요. 결국 C 코드가 운영체제를 불러요.')
      },
      2: { data: { sub: '세 언어 모두 여기서 같은 시스템 콜로 모여요' },
        text: '어떤 언어로 짰든 파일에 쓰려면 결국 write() 시스템 콜을 불러야 해요. 여기서부터 아래는 C · Java · Python이 똑같아요. CPU가 커널 모드로 바뀌고, 파일 시스템이 어느 블록에 쓸지 정해 우선 메모리(페이지 캐시)에 담아 둡니다.' }
    },
    'sw-web': {
      2: { data: { label: '프레임워크', value: L('struct request req = parse(buf)', 'HttpServletRequest (Spring)', 'HttpRequest (Django)'),
          sub: L('C는 보통 직접 파싱하거나 작은 라이브러리로', 'JVM 위의 Spring이 객체로', 'CPython 위의 Django가 객체로') } },
      3: { data: { value: L('get_order(42)', 'orderService.getOrder(42)', 'get_order(request, 42)') } }
    },
    'sw-launch': {
      1: { title: L('바로 main으로', '런타임 시작', '인터프리터 시작'),
        data: { label: '런타임', value: L('런타임 없음 · _start → main()', 'JVM 시작 · 클래스 로드', 'python 시작 · .py → 바이트코드'),
          sub: L('기계어라 바로 실행', '자주 쓰는 코드는 JIT으로 기계어로', '처음 한 번 컴파일해 .pyc로 저장') },
        text: L('C 프로그램은 이미 기계어라서 운영체제가 올려 주면 바로 main()부터 실행돼요. 준비 시간이 거의 없어요.',
          'Java 앱은 먼저 JVM이 켜지고, 필요한 클래스를 불러와 검사한 뒤 실행해요. 자주 도는 코드는 실행 중에 JIT이 기계어로 바꿔요.',
          'Python은 인터프리터(CPython)가 먼저 켜지고, .py 파일을 바이트코드로 바꿔(처음 한 번) 한 명령씩 실행해요.') }
    },
    'os-read': {
      0: { data: { value: L('read(fd, buf, 4096)', 'in.read(buf)  →  …  →  read()', 'f.read()  →  …  →  read()'),
          sub: L('C는 시스템 콜을 거의 그대로 불러요', 'JVM이 대신 read()를 불러요', 'CPython이 대신 read()를 불러요') } }
    },
    'app-save': {
      1: { data: { value: L('[clicked] → on_save()', '[click] → onSave()', '[clicked] → on_save()') } },
      2: { data: { value: L('text = strdup(get_text(editor))', 'String text = editor.getText()', 'text = editor.text()') } },
      3: { data: { value: L('set_status("저장 중…")', 'status.set("저장 중…")', 'status.set("저장 중…")') } },
      4: { data: { value: L('pthread_create(&t, NULL, save_job, text)', 'new Thread(() -> …).start()', 'threading.Thread(target=save_job).start()') } },
      5: { data: { value: L('fputs(text, fp)', 'Files.writeString(path, text)', 'f.write(text)'), sub: L('→ libc → write() 시스템 콜', '→ JVM → write() 시스템 콜', '→ CPython → write() 시스템 콜') } },
      6: { data: { value: L('g_idle_add(show_saved, NULL)', 'ui.later(() -> status.set("저장됨"))', 'ui.later(lambda: status.set("저장됨"))') } }
    },
    'rt-run': {
      0: { data: { value: L('int total = price * 3;', 'int total = price * 3;', 'total = price * 3'), sub: L('main.c', 'Main.java', 'main.py') },
        text: L('C는 변수마다 타입(int)을 적어요. 이 글자들을 CPU가 바로 읽진 못해요.', 'Java도 타입을 적어요. 이 코드는 클래스 안의 메서드에 들어 있어요.', 'Python은 타입을 적지 않아요. 값이 들어올 때 타입이 정해져요.') },
      1: { data: { value: L('gcc → 최적화 → x86 기계어', 'javac → AST → 바이트코드', 'CPython 컴파일러 → 바이트코드'),
          sub: L('실행 전에 한 번에 (AOT)', '실행 전에 바이트코드까지', '실행 직전에 자동으로') },
        text: L('gcc가 코드를 분석하고 최적화해서 CPU가 바로 실행할 기계어 파일을 만들어요. 실행하기 전에 번역이 다 끝나요.',
          'javac가 코드를 트리로 바꾼 뒤 JVM용 바이트코드(.class)로 번역해요. 기계어까지는 가지 않아요.',
          'python을 실행하면 CPython이 먼저 코드를 바이트코드로 번역해요. 따로 컴파일 명령이 없을 뿐, 번역 단계는 있어요.') },
      2: { title: L('기계어', '바이트코드', '바이트코드'),
        data: { value: L('imul eax, 3 · mov [total], eax', 'iload_1 · iconst_3 · imul · istore_2', 'LOAD_NAME price · LOAD_CONST 3 · BINARY_OP *'),
          sub: L('CPU 명령어 그대로', '.class 파일', '.pyc 파일') } },
      3: { data: { value: L('a.out → TEXT 영역', 'Main.class → 메서드 영역', 'main.pyc → 코드 객체'), sub: L('운영체제가 실행 파일을 올림', 'JVM의 클래스 로더가 읽고 검사', 'CPython이 바이트코드를 불러옴') },
        text: L('운영체제가 실행 파일의 기계어를 내 앱의 메모리(TEXT 영역)에 올려요. CPU는 실행이 끝날 때까지 여기서 명령을 하나씩 가져가요.',
          'JVM의 클래스 로더가 .class 파일을 읽고 검사한 뒤 메서드 영역에 올려요. 실행 엔진은 여기서 바이트코드를 하나씩 꺼내 가요.',
          'CPython이 .pyc(없으면 새로 번역한 바이트코드)를 코드 객체로 만들어 메모리에 둬요. 평가 루프가 여기서 명령을 하나씩 꺼내 가요.') },
      4: { title: L('CPU가 직접 실행', 'JVM이 실행 · JIT', '평가 루프가 실행'),
        data: { label: L('실행', 'JVM', 'CPython'), value: L('VM 없음 · CPU가 바로 실행', '해석 실행 → 1만 번 반복 → JIT', '평가 루프가 한 명령씩'),
          sub: L('가장 빠르지만 CPU · OS마다 따로 빌드', 'HotSpot이 뜨거운 코드를 기계어로', '기본적으로 JIT 없음 (3.13부터 실험적)') },
        text: L('C는 가상 머신이 없어요. 운영체제가 기계어를 메모리에 올리면 CPU가 그대로 실행해요.',
          'JVM이 바이트코드를 해석해 실행하다가, 같은 코드가 수천 번 돌면 JIT이 그 부분을 기계어로 바꿔 빠르게 해요.',
          'CPython의 평가 루프가 바이트코드를 한 명령씩 꺼내 실행해요. 그래서 같은 계산이 C보다 수십 배 느릴 수 있어요.') },
      5: { data: { value: L('total → 스택 · malloc() → 힙', 'int → 스택 · new 객체 → 힙', '모든 값이 힙의 객체 · 이름은 참조'),
          sub: L('힙은 내가 직접 관리', '객체는 GC가 관리', '숫자 3도 객체') },
        text: L('지역 변수는 스택에 생기고 함수가 끝나면 사라져요. malloc으로 받은 힙 메모리는 직접 돌려줘야 해요.',
          'int 같은 기본 타입 지역 변수는 스택에, new로 만든 객체는 힙에 담겨요.',
          'Python에서는 숫자 하나도 힙에 사는 객체예요. 변수 이름은 그 객체를 가리키는 참조일 뿐이에요.') },
      6: { title: L('직접 해제', '가비지 컬렉션', '참조 카운트'),
        data: { label: L('free()', 'GC', 'refcount'), value: L('GC 없음 · free(ptr)로 직접', 'G1 GC · 세대별로 표시 → 정리', '참조 0 → 즉시 해제 · 순환은 GC'),
          sub: L('잊으면 누수, 두 번 하면 오류', '멈춤 시간을 줄이는 게 숙제', '대부분 바로 치워져요') },
        text: L('C에는 청소부가 없어요. 다 쓴 메모리는 free()로 직접 돌려줘야 하고, 잊으면 메모리가 계속 새요.',
          'JVM의 가비지 컬렉터가 아무도 가리키지 않는 객체를 찾아 치워요. 젊은 객체부터 자주 검사해서 효율을 높여요.',
          'CPython은 객체마다 가리키는 수를 세다가 0이 되는 순간 바로 치워요. 서로를 가리키는 순환만 별도 GC가 맡아요.') }
    }
  };

  const merge = (dst, src) => { Object.entries(src).forEach(([k, v]) => { if (v && typeof v === 'object' && !('c' in v) && dst[k] && typeof dst[k] === 'object') merge(dst[k], v); else dst[k] = v; }); };
  (window.TOURS || []).forEach(t => { const p = PATCH[t.id]; if (p) Object.entries(p).forEach(([i, sp]) => t.steps[i] && merge(t.steps[i], sp)); });
  // C에는 실행 엔진 · GC가 없어서 화면에서 빠짐 → 그 단계는 코드 영역(CPU가 바로 실행) · 힙(free)을 가리킴
  const IDS = { 'rt-run': { 4: { c: ['code'], other: ['vm'] }, 6: { c: ['memory'], other: ['gc'] } } };
  (window.TOURS || []).forEach(t => { const m = IDS[t.id]; if (m) Object.entries(m).forEach(([i, v]) => t.steps[i] && Object.defineProperty(t.steps[i], 'ids', { get: () => (window.KBLang && KBLang.get() === 'c' ? v.c : v.other), configurable: true })); });
})();
