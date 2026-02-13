/**
 * Adminer plugin
 * Download select result as XLSX format.
 *
 * Install AdminerDumpXlsx to Adminer,
 * and place this file to the plugin directory.
 *
 * Install to Adminer on https://www.adminer.org/plugins/
 * @author Tom Higuchi, https://tom-gs.com/
 */
(function (window, document) {
  let vendorName = null;

  /**
   * Detect Adminer or Admin Neo
   *
   * @returns {String}
   */
  let detectVendor = function () {
    let url = new URL(document.getElementById('version').href);
    if (-1 !== url.hostname.indexOf('adminer')) {
      return 'adminer';
    } else if (-1 !== url.hostname.indexOf('adminneo')) {
      return 'adminneo';
    }
    return 'dbdumpxlsx';
  };

  /**
   * Get Adminer or Admin Neo
   *
   * @returns {String}
   */
  let getVendorName = function () {
    if (null === vendorName) {
      vendorName = detectVendor();
    }
    return vendorName;
  };

  /**
   * Adminer or not
   *
   *
   * @returns {Boolean}
   */
  let isAdminer = function () {
    return 'adminer' == getVendorName();
  };

  /**
   * Create dummy table tag from select result.
   *
   * @param {HTMLTableElement} tblElem
   * @param {String} id
   * @returns {String}
   */
  let createDummyTable = function (tblElem, id) {
    let trs = tblElem.querySelectorAll('tr');
    let html = `<table id="${id}" class="table-to-export" data-sheet-name="${id}">`;
    trs.forEach(function (tr, index) {
      // Adminer header: td th th th ...
      // Admin Neo header: th th th th ...
      let tag = 'td', selector = 'td', cells = [];
      if (0 === index) {
        tag = 'th';
        selector = 'th, td'; // for Admin Neo use th and td for header
      }
      cells = tr.querySelectorAll(selector);

      if (cells.length) {
        html += '<tr>';
        cells.forEach(function (td, index) {
          if (skipFirstCell(tblElem, index)) {
            return;
          }
          html += `<${tag}>` + getCellValue(td) + `</${tag}>`;
        });
        html += '</tr>';
      }
    });
    html += '</table>';
    return html;
  };

  /**
   * Check if the skippable cell or not.
   *
   * @param {HTMLTableElement} tblElem
   * @param {Number} index
   * @returns {Boolean}
   */
  let skipFirstCell = function (tblElem, index) {
    return 'table' == tblElem.id && 0 === index;
  };

  /**
   * Get plain value in cell.
   *
   * @param {HTMLTableElement} cell
   * @returns {String}
   */
  let getCellValue = function (cell) {
    if ('th' == cell.tagName.toLowerCase()) {
      let ret = cell.id.replace(/th\[(.*)\]/, '$1');
      if (!ret) {
      	let title = cell.hasAttribute('title') ? cell.getAttribute('title') : '';
        ret = title.split('.').slice(-1)[0];
      }
      return ret;
    } else if ('td' == cell.tagName.toLowerCase()) {
      let a = cell.querySelector('a');
      if (a) {
        return a.innerHTML;
      }
      return cell.innerHTML;
    }
  };

  /**
   * Add dump button.
   *
   * @param {HTMLElement} parent
   * @param {Number} index
   */
  let addDumpButton = function (parent, index) {
    let id = 'xlsx-' + index;

    // Placing space before download button on Adminer is much better
    let space = isAdminer() ? '&nbsp;' : '';

    parent.innerHTML += `${space}<button type="button" id="${id}" class="button">Download XLSX</button>`;
    let dlBtn = document.getElementById(id);
    dlBtn.addEventListener('click', function () {
      dumpXlsx();
    }, false);
  };

  /**
   * Zerofill
   *
   * @param {Number} number
   * @param {Number} length
   * @returns {String}
   */
  let zerofill = function (number, length) {
    return ('0'.repeat(length) + ('' + number)).slice(-length);
  };

  /**
   * Create file name for download file.
   *
   * @returns {String}
   */
  let createFileName = function () {
    let fileName = getVendorName() + '.';
    fileName += location.hostname + '.';

    let date = new Date();
    fileName += zerofill(date.getFullYear(), 4);
    fileName += zerofill(date.getMonth() + 1, 2);
    fileName += zerofill(date.getDate(), 2);
    fileName += '_';
    fileName += zerofill(date.getHours(), 2);
    fileName += zerofill(date.getMinutes(), 2);
    fileName += zerofill(date.getSeconds(), 2);
    fileName += '.xlsx';

    return fileName;
  };

  /**
   * Dump table data to XLSX.
   */
  let dumpXlsx = function () {
    // Options for sheets
    let wbopts = {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary',
      cellText: false,
      cellDates: true
    };

    // Options for workbook
    let wsopts = {
      //header: 1,
      //raw: false,
      dateNF: 'yyyy-mm-dd hh:mm:ss'
    };

    let workbook = {SheetNames: [], Sheets: {}};

    document.querySelectorAll('table.table-to-export').forEach(function (currentValue, index) {
      let n = currentValue.getAttribute('data-sheet-name');
      if (!n) {
        n = 'Sheet' + index;
      }
      workbook.SheetNames.push(n);
      workbook.Sheets[n] = XLSX.utils.table_to_sheet(currentValue, wsopts);
    });

    let wbout = XLSX.write(workbook, wbopts);
    saveAs(new Blob([s2ab(wbout)], {type: 'application/octet-stream'}), createFileName());
  };

  /**
   * Convert string to ArrayBuffer.
   *
   * @param {String} s
   * @returns {ArrayBuffer}
   */
  let s2ab = function (s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };

  /**
   * Detect parent element for export button.
   *
   * @param {String} selector1
   * @param {String} selector2
   * @returns HTMLElement|null
   */
  let detectParent = function (selector1, selector2) {
    let parent = document.querySelector(selector1);
    if (!parent) {
      parent = document.querySelector(selector2);
    }
    return parent;
  };

  /**
   * Create dummy table for select result page.
   *
   * @param {HTMLDivElement} div
   */
  let createDummyTableForSelectResultPage = function (div) {
    let table = document.getElementById('table');
    if (table) {
      div.innerHTML += createDummyTable(table, 'table-0');
      let parent = detectParent('#fieldset-export .fieldset-content', '#fieldset-export'); // Admin Neo, Adminer
      addDumpButton(parent, 0);
    }
  };

  /**
   * Create dummy tables for SQL result page.
   *
   * @param {HTMLDivElement} div
   */
  let createDummyTablesForSqlResultPage = function (div) {
    for (let i = 1; ; i++) {
      let sql = document.getElementById(`sql-${i}`);
      if (!sql) {
        break;
      }
      let table = sql.nextElementSibling.querySelector('table');
      if (table) {
        div.innerHTML += createDummyTable(table, `table-${i}`);
        let parent = detectParent(`#export-${i} p`, `#export-${i}`); // Admin Neo, Adminer
        addDumpButton(parent, i);
      }
    }
  };

  window.addEventListener('load', function () {
    let div = document.createElement('div');
    div.id = 'dummy-table-area';
    div.style.display = 'none';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);

    createDummyTableForSelectResultPage(div);
    createDummyTablesForSqlResultPage(div);
  }, false);

})(window, window.document);
