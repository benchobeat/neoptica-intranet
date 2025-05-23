// backend/src/utils/response.js

function success(data) {
  return {
    ok: true,
    data,
    error: null,
  };
}

function fail(error, data = null) {
  return {
    ok: false,
    data,
    error,
  };
}

module.exports = { success, fail };
