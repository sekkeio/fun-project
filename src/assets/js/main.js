document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.gallery'); // Исправлено на .gallery
    let iso;

    function getColumns() {
        const windowWidth = window.innerWidth;
        let columnNumber;
        if (windowWidth > 1440) columnNumber = 6;
        else if (windowWidth > 1280) columnNumber = 5;
        else if (windowWidth > 1024) columnNumber = 4;
        else if (windowWidth > 768) columnNumber = 3;
        else if (windowWidth > 365) columnNumber = 2;
        else columnNumber = 1;
        return columnNumber;
    }

    function updateLayout() {
        const columns = getColumns();
        const width = grid.offsetWidth;
        const newColumnWidth = (width / columns).toFixed(3);

        const sizer = document.querySelector('.grid_sizer');
        const items = document.querySelectorAll('.gallery-item');
        
        sizer.style.width = `${newColumnWidth}px`;
        items.forEach(item => {
            item.style.width = `${newColumnWidth}px`;
            item.style.boxSizing = 'border-box';
        });

        if (iso) {
            iso.options.masonry.columnWidth = '.grid_sizer';
            iso.layout();
        }
    }

    imagesLoaded(grid, function() {
        iso = new Isotope(grid, {
            itemSelector: '.gallery-item',
            layoutMode: 'masonry',
            percentPosition: true,
            masonry: {
                columnWidth: '.grid_sizer'
            },
            hiddenStyle: { opacity: 0 },
            visibleStyle: { opacity: 1 }
        });

        updateLayout();
        grid.classList.add('is_ready');
        
        emerge.refresh(); // Исправлено на emerge (вместо Emerge)
    });

    const filterButtons = document.querySelectorAll('.filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            iso.arrange({
                filter: this.getAttribute('data-filter'),
                transitionDuration: '0.4s'
            });

            iso.once('arrangeComplete', () => {
                emerge.refresh();
                updateLayout();
            });
        });
    });

    window.addEventListener('resize', function() {
        updateLayout();
        emerge.refresh();
    });

    Fancybox.bind('[data-fancybox]', {
        Thumbs: { showOnStart: false },
        Toolbar: { display: { right: ['download', 'close'] } },
        Image: { zoom: true, wheel: 'slide' }
    });
});

/* document.addEventListener('DOMContentLoaded', function () {
  Fancybox.bind('[data-fancybox]', {
    Thumbs: {
      showOnStart: false,
    },
    Toolbar: {
        display: {
            // left: ['infobar'],
            // middle: ['zoomIn', 'zoomOut', 'toggle1to1', 'rotateCCW', 'rotateCW'],
            right: ['download', 'close'],
        },
    },
    Image: {
        zoom: true,
        wheel: 'slide',
    }
});

  const grid = document.querySelector('.gallery-grid');
  const iso = new Isotope(grid, {
    itemSelector: '.gallery-item',
    percentPosition: true,
    masonry: {
      columnWidth: 30,
      rowHeight: 30
    },
    transitionDuration: 0
  });

  const filters = document.querySelectorAll('.filters button');
  filters.forEach(button => button.addEventListener('click', function () {
    const filterValue = this.getAttribute('data-filter');
    iso.arrange({ filter: filterValue });
  }));
});
*/

