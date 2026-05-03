/**
 * Concert Text Parser - Intelligently extract concert details from pasted text
 * Supports parsing: dates, band names, venues, cities, states, ratings, notes, URLs, and more
 */

(function initConcertTextParser(global) {
  'use strict';

  // ============================================================================
  // DATE PARSING
  // ============================================================================

  /**
   * Parse various date formats into ISO string (YYYY-MM-DD)
   * Supports: "12/15/2024", "12-15-2024", "December 15 2024", "Dec 15 2024", "15 Dec 2024", etc.
   */
  function parseDate(text) {
    if (!text) return '';

    var trimmed = String(text).trim();

    // Try standardized date formats first
    var isoMatch = trimmed.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return isoMatch[1] + '-' + isoMatch[2] + '-' + isoMatch[3];
    }

    // US format: 12/15/2024, 12.15.2024, 12-15-2024
    var usMatch = trimmed.match(/(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/);
    if (usMatch) {
      var month = String(usMatch[1]).padStart(2, '0');
      var day = String(usMatch[2]).padStart(2, '0');
      var year = usMatch[3];
      return year + '-' + month + '-' + day;
    }

    // Try parsing with JavaScript Date object
    try {
      var date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return '';
  }

  // ============================================================================
  // RATING PARSING
  // ============================================================================

  /**
   * Extract star rating or numeric rating from text
   * Supports: "5 stars", "5/5", "★★★★★", "Rating: 5", "4.5", etc.
   */
  function parseRating(text) {
    if (!text) return 0;

    var trimmed = String(text).trim();

    // Look for "X out of 5", "X/5", "X stars"
    var matches = [
      /(\d+)\s*(?:out of|\/)\s*5/i,
      /(\d+)\s*(?:stars?|\/5|★)/i,
      /rating\s*:?\s*(\d+)/i,
      /^(\d+)$/
    ];

    for (var i = 0; i < matches.length; i++) {
      var match = trimmed.match(matches[i]);
      if (match) {
        var rating = Math.max(0, Math.min(5, Number(match[1]) || 0));
        if (rating > 0) return rating;
      }
    }

    // Count star emoji
    var starCount = (trimmed.match(/★/g) || []).length;
    if (starCount > 0) return Math.min(5, starCount);

    return 0;
  }

  // ============================================================================
  // URL EXTRACTION
  // ============================================================================

  /**
   * Extract URLs of various types (video, setlist, etc.)
   */
  function extractUrls(text) {
    if (!text) return [];

    var urlPattern = /https?:\/\/[^\s]+/gi;
    var matches = text.match(urlPattern) || [];

    return matches.map(function(url) {
      return url.replace(/[,;.\)]+$/, ''); // Remove trailing punctuation
    }).filter(function(url) {
      return url.length > 10; // Reasonable minimum URL length
    });
  }

  function categorizeUrls(urls) {
    var categorized = {
      videoUrls: [],
      setlistUrls: [],
      otherUrls: []
    };

    urls.forEach(function(url) {
      var lower = url.toLowerCase();
      if (lower.includes('youtube') || lower.includes('vimeo') || lower.includes('youtu.be')) {
        categorized.videoUrls.push(url);
      } else if (lower.includes('setlist.fm') || lower.includes('setlist')) {
        categorized.setlistUrls.push(url);
      } else {
        categorized.otherUrls.push(url);
      }
    });

    return categorized;
  }

  // ============================================================================
  // BAND NAME EXTRACTION
  // ============================================================================

  /**
   * Extract likely band names from text
   * Looks for: "Band: NIN", "Artist: Depeche Mode", or all-caps phrases
   */
  function extractBandNames(text) {
    if (!text) return [];

    var candidates = [];

    // Explicit band/artist labels
    var bandsMatch = text.match(/(?:band|artist|performer|group|act)[:=\s]+([^\n,;]+)/gi);
    if (bandsMatch) {
      bandsMatch.forEach(function(match) {
        var name = match.replace(/^(?:band|artist|performer|group|act)[:=\s]+/i, '').trim();
        if (name.length > 2 && name.length < 100) {
          candidates.push(name);
        }
      });
    }

    // Lines that are all-caps or title case (likely band names)
    var lines = text.split(/[\n\r]+/);
    lines.forEach(function(line) {
      var cleaned = line.trim();
      if (cleaned.length > 2 && cleaned.length < 100) {
        // Check if it looks like a band name (mostly uppercase, no common punctuation)
        var isAllCaps = /^[A-Z\s&\-\.\(\)]+$/.test(cleaned);
        if (isAllCaps && !cleaned.match(/^\d+|^[A-Z]{1,2}$|venue|concert|show|date|time|city|state|rating/i)) {
          candidates.push(cleaned);
        }
      }
    });

    return Array.from(new Set(candidates.map(function(n) { return n.trim(); })));
  }

  // ============================================================================
  // VENUE EXTRACTION
  // ============================================================================

  /**
   * Extract venue name from text
   * Looks for: "Venue: X", "at X", "Venue name", etc.
   */
  function extractVenue(text) {
    if (!text) return '';

    // Explicit venue labels
    var venueMatch = text.match(/venue\s*[:=]\s*([^\n,;]+)/i);
    if (venueMatch) {
      return venueMatch[1].trim();
    }

    // "at" followed by venue name
    var atMatch = text.match(/(?:at|@)\s+([^\n,;]+)/i);
    if (atMatch) {
      var venue = atMatch[1].trim();
      // Filter out common non-venue phrases
      if (!venue.match(/^\d+|ago|night|pm|am|time|date|year/i)) {
        return venue;
      }
    }

    return '';
  }

  // ============================================================================
  // CITY/STATE EXTRACTION
  // ============================================================================

  /**
   * Extract city and state
   * Supports: "Dallas, TX", "Dallas, Texas", "Dallas TX", "Dallas, TX 75201"
   */
  function extractLocation(text) {
    if (!text) return { city: '', state: '' };

    // Look for common city/state patterns
    var match = text.match(/([A-Z][a-z\s]+),?\s+([A-Z]{2})/);
    if (match) {
      return {
        city: match[1].trim(),
        state: match[2].trim()
      };
    }

    // Try to find standalone city name before state abbreviation
    var stateMatch = text.match([
      /(?:city|in|at)\s*:?\s*([A-Z][a-z]+)/i,
      /([A-Z][a-z]+)\s+([A-Z]{2})/
    ].map(function(pattern) {
      return text.match(pattern);
    }).find(function(m) { return m; }));

    if (stateMatch) {
      return {
        city: stateMatch[1].trim(),
        state: stateMatch[2] ? stateMatch[2].trim() : ''
      };
    }

    return { city: '', state: '' };
  }

  // ============================================================================
  // ATTENDEE EXTRACTION
  // ============================================================================

  /**
   * Extract who attended (Kyle, Heather, Both)
   */
  function extractAttendee(text) {
    if (!text) return 'Both';

    var lower = text.toLowerCase();
    if (lower.includes('kyle') && !lower.includes('heather')) return 'Kyle';
    if (lower.includes('heather') && !lower.includes('kyle')) return 'Heather';
    return 'Both';
  }

  // ============================================================================
  // NOTES EXTRACTION
  // ============================================================================

  /**
   * Extract relevant notes/comments about the concert
   */
  function extractNotes(text) {
    if (!text) return '';

    // Remove already-parsed structured data
    var cleaned = text
      .replace(/(?:band|artist|performer|group)[:=][^\n]+/gi, '')
      .replace(/venue[:=][^\n]+/i, '')
      .replace(/(?:date|time|concert|show)[:=][^\n]+/gi, '')
      .replace(/rating[:=][^\n]+/i, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .replace(/\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/g, '')
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      .trim();

    // Take first 2-3 sentences or first 200 chars
    var notesMatch = cleaned.match(/^([^\n\r].{0,200})/);
    return notesMatch ? notesMatch[1].trim() : '';
  }

  // ============================================================================
  // MAIN PARSING FUNCTION
  // ============================================================================

  /**
   * Parse concert details from pasted text
   * @param {string} text - Raw pasted text
   * @param {Array} favoriteBands - List of favorite band names for validation
   * @returns {object} Parsed concert data with confidence scores
   */
  function parseConcertText(text, favoriteBands) {
    if (!text) {
      return {
        success: false,
        message: 'No text provided',
        data: {}
      };
    }

    favoriteBands = Array.isArray(favoriteBands) ? favoriteBands : [];

    // Extract data
    var urls = extractUrls(text);
    var urlTypes = categorizeUrls(urls);
    var bandCandidates = extractBandNames(text);
    var location = extractLocation(text);

    // Find best matching band (fuzzy match against favorites)
    var bandName = '';
    var bandConfidence = 'low';

    if (bandCandidates.length > 0) {
      // Try exact match first
      var exactMatch = bandCandidates.find(function(candidate) {
        return favoriteBands.some(function(fav) {
          return normalizeText(candidate) === normalizeText(fav);
        });
      });

      if (exactMatch) {
        bandName = exactMatch;
        bandConfidence = 'high';
      } else {
        // Try partial match
        var partialMatch = bandCandidates.find(function(candidate) {
          return favoriteBands.some(function(fav) {
            return fav.toLowerCase().includes(candidate.toLowerCase()) ||
                   candidate.toLowerCase().includes(fav.toLowerCase());
          });
        });

        if (partialMatch) {
          bandName = partialMatch;
          bandConfidence = 'medium';
        } else {
          // Use first candidate as best guess
          bandName = bandCandidates[0];
          bandConfidence = 'low';
        }
      }
    }

    // Extract dates
    var dates = [];
    var dateMatches = text.match(/[0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4}|[0-9]{4}-[0-9]{2}-[0-9]{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^\n]*\d{4}/gi);
    if (dateMatches) {
      dateMatches.forEach(function(dateStr) {
        var parsed = parseDate(dateStr);
        if (parsed && dates.indexOf(parsed) === -1) {
          dates.push(parsed);
        }
      });
    }

    var result = {
      success: bandName.length > 0 || dates.length > 0,
      message: '',
      data: {
        bandName: bandName,
        bandConfidence: bandConfidence,
        date: dates[0] || '',
        venue: extractVenue(text),
        city: location.city,
        state: location.state,
        rating: parseRating(text),
        attendedBy: extractAttendee(text),
        videoUrl: urlTypes.videoUrls[0] || '',
        setlistUrl: urlTypes.setlistUrls[0] || '',
        notes: extractNotes(text),
        confidence: {
          bandName: bandConfidence,
          date: dates.length > 0 ? 'high' : 'low',
          venue: extractVenue(text).length > 0 ? 'medium' : 'low',
          location: (location.city.length > 0 && location.state.length > 0) ? 'high' : 'low',
          rating: parseRating(text) > 0 ? 'high' : 'low'
        }
      }
    };

    if (result.success) {
      result.message = 'Parsed ' +
        (result.data.bandName ? '1 band, ' : '') +
        (result.data.date ? '1 date, ' : '') +
        (result.data.venue ? '1 venue' : '') +
        (result.data.city ? (result.data.venue ? ', city/state' : 'city/state') : '');
    }

    return result;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  function normalizeText(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Merge parsed data into form, allowing user to override
   * @param {object} formElement - The form to populate
   * @param {object} parsedData - Parsed concert data
   */
  function applyParsedDataToForm(formElement, parsedData) {
    if (!formElement || !parsedData) return;

    var data = parsedData.data || {};

    // Apply band name
    if (data.bandName) {
      var bandSelect = formElement.querySelector('[name="Band_Name"]');
      if (bandSelect) {
        bandSelect.value = data.bandName;
      }
    }

    // Apply date
    if (data.date) {
      var dateInput = formElement.querySelector('[name="Concert_Date"]');
      if (dateInput) {
        dateInput.value = data.date;
      }
    }

    // Apply venue
    if (data.venue) {
      var venueInput = formElement.querySelector('[name="Venue"]');
      if (venueInput) {
        venueInput.value = data.venue;
      }
    }

    // Apply city
    if (data.city) {
      var cityInput = formElement.querySelector('[name="City"]');
      if (cityInput) {
        cityInput.value = data.city;
      }
    }

    // Apply state
    if (data.state) {
      var stateInput = formElement.querySelector('[name="State"]');
      if (stateInput) {
        stateInput.value = data.state;
      }
    }

    // Apply rating
    if (data.rating > 0) {
      var ratingInput = formElement.querySelector('[name="Rating"]');
      if (ratingInput) {
        ratingInput.value = data.rating;
      }
    }

    // Apply notes
    if (data.notes) {
      var notesInput = formElement.querySelector('[name="Notes"]');
      if (notesInput) {
        notesInput.value = data.notes;
      }
    }

    // Apply video URL
    if (data.videoUrl) {
      var videoInput = formElement.querySelector('[name="Video_URL"]');
      if (videoInput) {
        videoInput.value = data.videoUrl;
      }
    }

    // Apply setlist URL
    if (data.setlistUrl) {
      var setlistInput = formElement.querySelector('[name="Setlist_URL"]');
      if (setlistInput) {
        setlistInput.value = data.setlistUrl;
      }
    }

    // Apply attended by
    if (data.attendedBy) {
      var attendeeSelect = formElement.querySelector('[name="Attended_By"]');
      if (attendeeSelect) {
        attendeeSelect.value = data.attendedBy;
      }
    }
  }

  /**
   * Build confidence badge HTML
   */
  function getConfidenceBadge(confidence) {
    var colors = {
      high: '#4CAF50',
      medium: '#FFA500',
      low: '#f44336'
    };

    var labels = {
      high: '✓ High',
      medium: '• Medium',
      low: '? Low'
    };

    return '<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:' + colors[confidence] + ';color:white;font-size:11px;font-weight:bold;">' + labels[confidence] + '</span>';
  }

  // ============================================================================
  // EXPORTS
  // ============================================================================

  global.ConcertTextParser = {
    parseConcertText: parseConcertText,
    parseDate: parseDate,
    parseRating: parseRating,
    extractUrls: extractUrls,
    extractBandNames: extractBandNames,
    extractVenue: extractVenue,
    extractLocation: extractLocation,
    extractAttendee: extractAttendee,
    extractNotes: extractNotes,
    applyParsedDataToForm: applyParsedDataToForm,
    getConfidenceBadge: getConfidenceBadge
  };

})(typeof window !== 'undefined' ? window : global);

